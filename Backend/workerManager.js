import {fork} from "node:child_process"


const workers = []

const workersCnt = 2

for(let i =0;i<workersCnt;i++){
    let worker =  fork('./src/Queue/worker.js')
    workers.push(worker)
    console.log(`Started worker ${i + 1}, PID: ${worker.pid}`);

     worker.on("exit", (code, signal) => {
        console.log(
            `Worker ${worker.pid} exited. code=${code}, signal=${signal}`
        );
    });

    worker.on("error", (err) => {
        console.error(`Worker ${worker.pid} error:`, err);
    });

}