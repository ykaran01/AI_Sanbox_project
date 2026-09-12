import { Queue, Worker } from "bullmq";
import { HumanMessage } from "@langchain/core/messages";

import { redisConnection } from "../db/connetDB.js";
import { graph } from "../langraph/Langraph.js";

const llmQueue = new Queue("llm_queue", {
    connection: redisConnection,
});


export const puttingInputInQueue = async (input) => {

    const job = await llmQueue.add(
        "userInput",
        input );

    return job.id;
};


const worker = new Worker(
    "llm_queue",

    async (job) => {

        console.log(`Processing job: ${job.id}`);
        const { userId, userInput } = job.data;

        const initialState = {

            messages: [
                new HumanMessage(userInput)
            ],

            userId: userId,
        };

        const result = await graph.invoke(initialState);


        console.log(`Job ${job.id} completed`);

        return result;
    },

    {
        connection: redisConnection,
        concurrency: 2,
    }
);


worker.on("completed", (job) => {

    console.log(`Job ${job.id} completed successfully`);

});


worker.on("failed", (job, error) => {

    console.error(
        `Job ${job?.id} failed:`,
        error.message
    );

});


worker.on("error", (error) => {

    console.error(
        "BullMQ Worker Error:",
        error
    );

});


export default worker;