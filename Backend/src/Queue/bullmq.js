
import { Queue, Worker } from "bullmq";
import { HumanMessage } from "@langchain/core/messages";

import { exceutionModel } from "../models/execution.model.js";
import { redisConnection, publiser } from "../db/connetDB.js";
import { graph } from "../langraph/Langraph.js";

const llmQueue = new Queue("llm_queue", {
    connection: redisConnection,
});

export const puttingInputInQueue = async (input) => {
    const {
        userId,
        userInput,
        threadId,
    } = input;

    const job = await llmQueue.add(
        "userInput",
        {
            userId,
            userInput,
            threadId,
        }
    );

    await exceutionModel.create({
        userId,
        executionId: job.id,
        userPrompt: userInput,
        threadId:threadId
    });

    console.log(`Job ${job.id} added to queue`);

    return job.id;
};

export const worker = new Worker(
    "llm_queue",
    async (job) => {
        const {
            userId,
            userInput,
            threadId,
        } = job.data;

        await publiser.publish(
            `thread:${threadId}`,
            JSON.stringify({
                jobId: job.id,
                threadId,
                status: "processing",
            })
        );

        const initialState = {
            userPrompt: userInput,
            messages: [
                new HumanMessage(userInput),
            ],
            userId,
            executionId: job.id,
            maxiterations: 3,
            iteration: 0,
            threadId:threadId,
            code: "",
            language: "",
            dependencies: [],
            result: "",
            errorMessages: [],
            success: false,
            executionTime: 0,
        };

        const result = await graph.invoke(initialState,{
            configurable:{
                 thread_id :threadId,
            }
        });
        console.log(result)
        const messages = (result.messages || []).map((message) => ({
            type: message._getType(),
            content: message.content,
        }));

        await exceutionModel.findOneAndUpdate(
            {
                executionId: job.id,
                userId,
            },
            {
                type: result.type || "",
                language: result.language || "",
                code: result.code || "",
                result: result.result || "",
                messages,
                success: result.success || false,
                executionTime: result.executionTime || 0,
                iteration: result.iteration || 0,
            },

            {
                returnDocument: "after",
            }
        );

        await publiser.publish(
            `thread:${threadId}`,
            JSON.stringify({
                type:result.type,
                jobId: job.id,
                status: "completed",
                messages:messages[messages.length-1],
                success: result.success || false,
                code:result.code || "",
                language:result.language,
                result: result.result || "",
            })
        );


        console.log(`Job ${job.id} completed`);
        
    },

    {
        connection: redisConnection,
        concurrency: 2,
    }
);




worker.on("failed", async (job, error) => {
    console.error(
        `Job ${job?.id} failed:`,
        error.message
    );
    if (!job) return;
    const {
        userId,
        threadId,
    } = job.data;
    await exceutionModel.findOneAndUpdate(
        {
            executionId: job.id,
            userId,
        },
        {
        error: error.message,
        }
    );
    await publiser.publish(
        `thread:${threadId}`,
        JSON.stringify({
            jobId: job.id,
            threadId,
            status: "failed",
            error: error.message,
        })
    );
});

