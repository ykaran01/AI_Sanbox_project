import { spawn } from 'child_process'
import {runtimes} from '../services/values.js'

const TIMEOUT = 20000;

const executeCode = async (state) => {
    const { language, code } = state;

    const runtime = runtimes[language];
    if (!runtime) {
        throw new Error(`Unsupported language: ${language}`);
    }

// Resource Limiting

    return new Promise((resolve) => {
        const command = runtime.compile ? `${runtime.compile} && ${runtime.run}` : runtime.run;
        const docker = spawn("docker", [
            "run",
            "--rm",
            "-i",

            // Resource Limiting

            "--memory=250m",
            "--cpus=0.5",
            "--pids-limit=50",

            "--cap-drop=ALL",

            runtime.image,
            "sh",
            "-c",
            `cat > ${runtime.sourceFile} && ${command}`
        ])
        let strout = "";
        let strerr = "";

        docker.stdout.on("data", (data) => {
            strout += data.toString();
        })
        let time = false;
        const timer = setTimeout(()=>{
            time = true;
            docker.kill('SIGKILL')
        },TIMEOUT)
        docker.stderr.on("data", (data) => {
             clearTimeout(timer)
            strerr += data.toString();
        })
        docker.on("close", (exitCode) => {
            clearTimeout(timer)
            resolve({ exitCode, strout, strerr:time? "This code has execution time more the 30 seconds" :strerr})
        })
        docker.stdin.write(code);
        docker.stdin.end();
    })
}

export const Sandbox_execution = async (state) => {
    const response = await executeCode(state);

    return {
        result: response.strout,
        errorMessages: response.strerr ? [response.strerr] : [],
        success: response.exitCode === 0
    };
};






