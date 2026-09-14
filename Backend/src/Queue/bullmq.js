import { Queue, Worker } from "bullmq";
import { HumanMessage } from "@langchain/core/messages";
import { exceutionModel } from "../models/execution.model.js";
import { redisConnection, publiser } from "../db/connetDB.js";
import { graph } from "../langraph/Langraph.js";


const llmQueue = new Queue("llm_queue", {
    connection: redisConnection,
});

export const puttingInputInQueue = async (input) => {
    const { userId, userInput } = input;
    const job = await llmQueue.add(
        "userInput",
        {
            userId,
            userInput,
        }
    );
    await exceutionModel.create({

        userId: userId,

        executionId: job.id,

        userPrompt: userInput,

        status: "queued",

        maxIterations: 3,

    });
    console.log(
        `Job ${job.id} added to queue`
    );
    return job.id;
};

export const worker = new Worker(
    "llm_queue",

    async (job) => {

        console.log(
            `Processing job: ${job.id}`
        );
        const {
            userId,
            userInput
        } = job.data;
        await publiser.publish(
            `job:${job.id}`,
            JSON.stringify({
                status: "queued",
            })
        );

        await exceutionModel.findOneAndUpdate(
            {
                executionId: job.id,
                userId: userId,
            },
            {
                status: "processing",
            }
        );
        const initialState = {

            userPrompt: userInput,

            messages: [
                new HumanMessage(userInput),
            ],
            userId: userId,
             executionId:job.id,
            maxiterations: 3,
            iteration: 0,
            code: "",
            language: "",
            dependencies: [],
            result: "",
            errorMessages: [],
            success: false,
            executionTime: 0,
        };

        const result =
            await graph.invoke(initialState);
        JSON.stringify({
                status: "completed",
            })
        await exceutionModel.findOneAndUpdate(

            {
                executionId: job.id,
                userId: userId,
            },

            {
                status: "completed",
                language: result.language,
                code: result.code,
                dependencies:
                    result.dependency || [],
                result: result.result || "",
                messages:
                    result.messages || [],
                errorMessages:
                    result.errorMessages || [],
                success:
                    result.success || false,

                executionTime: result.executionTime || 0,
                iteration:
                    result.iteration || 0,

            },

            {
                new: true,
            }
        );

        console.log(
            `Job ${job.id} completed`
        );
        return result;
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
    await publiser.publish(
            `job:${job.id}`,
            JSON.stringify({
                status: "failed",
            })
        );
    if (job) {
        await exceutionModel.findOneAndUpdate(
            {
                executionId: job.id,
                userId: job.data.userId,
            },
            {
                status: "failed",
                error: error.message,
            }
        );
    }

});
