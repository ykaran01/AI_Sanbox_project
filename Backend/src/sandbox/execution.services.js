import { spawn } from "child_process";
import { runtimes } from "../services/values.js";
import { publiser } from "../db/connetDB.js";
const INSTALL_TIMEOUT = 120000;
import { randomUUID } from "crypto";

const PYTHON_PACKAGE =
    /^[A-Za-z0-9][A-Za-z0-9._-]*(?:==[A-Za-z0-9][A-Za-z0-9.!+_-]*)?$/;

const NPM_PACKAGE =
    /^(?:@[A-Za-z0-9._-]+\/)?[A-Za-z0-9._-]+(?:@[0-9][A-Za-z0-9.+_-]*)?$/;


const TIMEOUT = 30000;


const installDependencies = async (
    language,
    dependencies,
    runtime,
    volume
) => {
    if (dependencies.length === 0) {
        return { exitCode: 0, stdout: "", stderr: "", timeout: false };
    }

    const installCommand =
        language === "python"
            ? 'python -m pip install --no-cache-dir --target /workspace/.deps "$@"'
            : 'npm install --prefix /workspace --ignore-scripts --no-audit --no-fund "$@"';

    const result = await runDocker(
        [
            "run",
            "--rm",
            "--network=bridge",
            "--memory=512m",
            "--memory-swap=512m",
            "--cpus=1",
            "--pids-limit=100",
            "--cap-drop=ALL",
            "--security-opt=no-new-privileges",
            "-v", `${volume}:/workspace`,
            "-w", "/workspace",
            runtime.image,
            "sh",
            "-c",
            installCommand,
            "install-deps",
            ...dependencies
        ],
        "",
        INSTALL_TIMEOUT
    );

    if (result.timeout) {
        throw new Error("Dependency installation timed out.");
    }

    if (result.exitCode !== 0) {
        throw new Error(
            `Dependency installation failed:\n${result.stderr}`
        );
    }

    return result;
};


const validateDependencies = (dependencies, language) => {
    if (dependencies == null) return [];

    if (!Array.isArray(dependencies) || dependencies.length > 10) {
        throw new Error("Invalid dependency list; maximum is 10 packages.");
    }

    if (dependencies.length === 0) return [];

    if (!["python", "javascript"].includes(language)) {
        throw new Error(`Dependencies are unsupported for ${language}.`);
    }

    const pattern =
        language === "python" ? PYTHON_PACKAGE : NPM_PACKAGE;

    for (const dependency of dependencies) {
        if (
            typeof dependency !== "string" ||
            dependency.length > 100 ||
            !pattern.test(dependency)
        ) {
            throw new Error(`Invalid dependency: ${dependency}`);
        }
    }

    return [...new Set(dependencies)];
};

const runDocker = (args, input = "", timeout = TIMEOUT) =>
    new Promise((resolve) => {
        let stdout = "";
        let stderr = "";
        let timedOut = false;
        let settled = false;

        const finish = (result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(result);
        };

        const docker = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });

        const timer = setTimeout(() => {
            timedOut = true;
            docker.kill("SIGKILL");
        }, timeout);

        docker.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        docker.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        docker.on("error", (error) => {
            finish({
                exitCode: -1,
                stdout,
                stderr: error.message,
                timeout: false
            });
        });

        docker.on("close", (exitCode) => {
            finish({
                exitCode,
                stdout,
                stderr,
                timeout: timedOut
            });
        });

        docker.stdin.end(input);
});

const executeCode = async (state) => {
    const { language, code, executionId } = state.job;
    const { threadId } = state;

    const runtime = runtimes[language];

    if (!runtime) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const dependencies = validateDependencies(
        state.job.dependencies,
        language
    );

    await publiser.publish(
        `thread:${threadId}`,
        JSON.stringify({
            jobId: executionId,
            threadId,
            status: "running"
        })
    );

    const startTime = performance.now();


    const volume = `box-agent-${randomUUID()}`;
    let volumeCreated = false;

    try {
        if (dependencies.length > 0) {
            const created = await runDocker(
                ["volume", "create", volume],
                "",
                10000
            );

            if (created.exitCode !== 0) {
                throw new Error(`Could not create workspace: ${created.stderr}`);
            }

            volumeCreated = true;

            await installDependencies(
                language,
                dependencies,
                runtime,
                volume
            );
        }

        const command = runtime.compile
            ? `${runtime.compile} && ${runtime.run}`
            : runtime.run;

        const args = [
            "run",
            "--rm",
            "-i",
            "--network=none",
            "--memory=250m",
            "--memory-swap=250m",
            "--cpus=0.5",
            "--pids-limit=50",
            "--cap-drop=ALL",
            "--security-opt=no-new-privileges"
        ];

        if (volumeCreated) {
            args.push("-v", `${volume}:/workspace`);
        }

        args.push(
            "-w", "/workspace"
        );

        if (language === "python" && dependencies.length > 0) {
            args.push("-e", "PYTHONPATH=/workspace/.deps");
        }

        args.push(
            runtime.image,
            "sh",
            "-c",
            `cat > ${runtime.sourceFile} && ${command}`
        );

        const response = await runDocker(args, code, TIMEOUT);

        return {
            exitCode: response.exitCode,
            stdout: response.stdout,
            stderr: response.stderr,
            timeout: response.timeout,
            executionTime: (
                (performance.now() - startTime) / 1000
            ).toFixed(2),
            error: response.timeout
                ? "This code exceeded the 30 second execution limit."
                : response.stderr
        };
    } finally {
        if (volumeCreated) {
            await runDocker(
                ["volume", "rm", "-f", volume],
                "",
                10000
            );
        }
    }
};

export const Sandbox_execution = async (state) => {
    try {
        const response = await executeCode(state);
        const error = response.error || "";

        let errorType = null;

        if (response.timeout) {
            errorType = "timeout";
        } else if (
            error.includes("Cannot find module") ||
            error.includes("MODULE_NOT_FOUND") ||
            error.includes("ModuleNotFoundError") ||
            error.includes("No module named")
        ) {
            errorType = "dependency";
        } else if (
            ["java", "c", "cpp"].includes(state.job.language) &&
            response.exitCode !== 0
        ) {
            errorType = "compilation_error";
        } else if (response.exitCode !== 0) {
            errorType = "runtime_error";
        }
        return {
            job: {
                ...state.job,
                result: response.stdout,
                errorMessages: error ? [error] : [],
                success: response.exitCode === 0 && !response.timeout,
                executionTime: response.executionTime,
                errorType
            }
        };
    } catch (error) {
        return {
            job: {
                ...state.job,
                success: false,
                errorMessages: [error.message],
                errorType: "dependency",
                executionTime: "0.00"
            }
        };
    }
};