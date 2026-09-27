import { spawn } from "child_process";
import { runtimes } from "../services/values.js";
import { publiser } from "../db/connetDB.js";

const TIMEOUT = 30000;

const executeCode = async (state) => {
    const {
        language,
        code,
        executionId,
    } = state.job;

    const { threadId } = state;

    console.log("Executing code in language:", language);

    const runtime = runtimes[language];

    if (!runtime) {
        throw new Error(`Unsupported language: ${language}`);
    }

    await publiser.publish(
        `thread:${threadId}`,
        JSON.stringify({
            jobId: executionId,
            threadId,
            status: "running",
        })
    );

    const startTime = performance.now();

    const command = runtime.compile
        ? `${runtime.compile} && ${runtime.run}`
        : runtime.run;

    return new Promise((resolve) => {
        const docker = spawn("docker", [
            "run",
            "--rm",
            "-i",


            "--network=none",

            "--memory=250m",
            "--memory-swap=250m",
            "--cpus=0.5",
            "--pids-limit=50",

            "--cap-drop=ALL",
            "--security-opt=no-new-privileges",

            runtime.image,
            "sh",
            "-c",
            `cat > ${runtime.sourceFile} && ${command}`,
        ]);

        let stdout = "";
        let stderr = "";
        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            docker.kill("SIGKILL");
        }, TIMEOUT);

        docker.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        docker.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        docker.on("close", (exitCode) => {
            clearTimeout(timer);

            const executionTime = (
                (performance.now() - startTime) / 1000
            ).toFixed(2);

            resolve({
                exitCode,
                stdout,
                stderr,
                timeout: timedOut,
                executionTime,

                error: timedOut
                    ? "This code exceeded the 30 second execution limit."
                    : stderr,
            });
        });

        docker.on("error", (error) => {
            clearTimeout(timer);

            resolve({
                exitCode: -1,
                stdout,
                stderr: error.message,
                timeout: false,
                executionTime: (
                    (performance.now() - startTime) / 1000
                ).toFixed(2),
                error: error.message,
            });
        });

        docker.stdin.write(code);
        docker.stdin.end();
    });
};


export const Sandbox_execution = async (state) => {
    try {
        const response = await executeCode(state);

        const error = response.error || "";

        let errorType = null;

        if (response.timeout) {
            errorType = "timeout";
        }
        else if (
            error.includes("MODULE_NOT_FOUND") ||
            error.includes("Cannot find module")
        ) {
            errorType = "dependency";
        }
        else if (
            ["java", "c", "cpp"].includes(state.job.language) &&
            response.exitCode !== 0
        ) {
            errorType = "compilation_error";
        }
        else if (response.exitCode !== 0) {
            errorType = "runtime_error";
        }

        const success =
            response.exitCode === 0 &&
            !response.timeout;

        return {
            job: {
                ...state.job,

                result: response.stdout,

                errorMessages: response.error
                    ? [response.error]
                    : [],

                success,

                executionTime: response.executionTime,

                errorType,
            },
        };

    } catch (error) {
        console.error("Sandbox execution error:", error);

        return {
            job: {
                ...state.job,

                success: false,

                errorMessages: [error.message],

                errorType: "sandbox_error",

                executionTime: "0.00",
            },
        };
    }
};