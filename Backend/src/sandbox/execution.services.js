import { spawn } from "child_process";
import { getTheDownload, runtimes } from "../services/values.js";
import {publiser} from "../db/connetDB.js"

const TIMEOUT = 30000;

const executeCode = async (state) => {
    const { language, code } = state;

    const runtime = runtimes[language];
    if (!runtime) {
        throw new Error(`Unsupported language: ${language}`);
    }
    await publiser.publish(`job:${state.executeId}`,JSON.stringify({status:"running"}))
    const startTime = performance.now();
    let command = runtime.compile
            ? `${runtime.compile} && ${runtime.run}`
            : runtime.run;
    
    
    return new Promise((resolve) => {
        const docker = spawn("docker", [
            "run",
            "--rm",
            "-i",

            // Security / resource limits
            "--network=none",
            "--memory=250m",
            "--cpus=0.5",
            "--pids-limit=50",
            "--cap-drop=ALL",
            "--security-opt=no-new-privileges",

            runtime.image,
            "sh",
            "-c",
            `cat > ${runtime.sourceFile} && ${command}`
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

            const executionTime =
                ((performance.now() - startTime) / 1000).toFixed(2);

            resolve({
                exitCode,
                stdout,
                stderr,
                timeout: timedOut,
                executionTime,
                error: timedOut
                    ? "This code exceeded the 30 second execution limit."
                    : stderr
            });
        });

        docker.on("error", (error) => {

            clearTimeout(timer);

            resolve({
                exitCode: -1,
                stdout,
                stderr: error.message,
                timeout: false,
                executionTime:
                    ((performance.now() - startTime) / 1000).toFixed(2),
                error: error.message
            });
        });

        docker.stdin.write(code);
        docker.stdin.end();
    });
};


export const Sandbox_execution = async (state) => {

    const response = await executeCode(state);
    
    const error = response.error || "";

    let errorType = "unknown";


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
        state.language === "java" ||
        state.language === "c" ||
        state.language === "cpp"
    ) {

        if (response.exitCode !== 0) {
            errorType = "compilation_error";
        }
    }
    else if (response.exitCode !== 0) {

        errorType = "runtime_error";
    }

    else {

        errorType = null;
    }

    return {

        result: response.stdout,

        errorMessages: response.error
            ? [response.error]
            : [],

        success:
            response.exitCode === 0 &&
            !response.timeout,

        executionTime: response.executionTime,

        errorType
    };
};