
import { Queue, Worker } from "bullmq";
import { HumanMessage } from "@langchain/core/messages";

import { exceutionModel } from "../models/execution.model.js";
import { redisConnection, publiser } from "../db/connetDB.js";
import { graph } from "../langraph/Langraph.js";

// QUEUE
// --------------------------------------------------

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
        userprompt: userInput,
        threadId,
        success: false,
        iteration: 0,
    });

    

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
            userId,
            threadId,
            messages: [
                new HumanMessage(userInput),
            ],

            job: {
                executionId: job.id,
                userPrompt: userInput,
                type: "",
                code: "",
                language: "",
                result: "",
                message: "",
                errorMessages: [],
                executionTime: 0,
                dependency: [],
                success: false,
                iteration: 0,
                maxIterations: 3,
                errorType: null,
            },
        };

        const result = await graph.invoke(
            initialState,
            {
                configurable: {
                    thread_id: threadId,
                },
            }
        );

        
        const finalJob = result.job || {};

        const messages = finalJob.message 

        const updatedExecution =
            await exceutionModel.findOneAndUpdate(

                {
                    executionId: job.id,
                    userId,
                },
                {
                  type: finalJob.type || "",

                    language: finalJob.language || "",

                    code: finalJob.code || "",

                    result: finalJob.result || "",

                    messages,

                    success: finalJob.success || false,

                    executionTime:
                        finalJob.executionTime || 0,

                    iteration:
                        finalJob.iteration || 0,

                    
                },

                {
                    new: true,
                }
            );


        

        await publiser.publish(
            `thread:${threadId}`,

            JSON.stringify({
                type: finalJob.type,
                jobId: job.id,
                threadId,
                status: "completed",
                message:messages,
                success:finalJob.success || false,
                code:finalJob.code || "",
                language:finalJob.language || "",
                result:finalJob.result || "",
            
            })
        );


        console.log(
            `Job ${job.id} completed`
        );
    },



    {
        connection: redisConnection,
        concurrency: 2,
    }
);

worker.on("failed", async (job, error) => {

   

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
            success: false,
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

