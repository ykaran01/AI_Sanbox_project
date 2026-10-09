import dotenv from "dotenv";
import path from "node:path"
import { fileURLToPath } from "node:url";
const _dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({
    path:path.resolve(_dirname,"../.env")
})
import { redisConnection, publiser ,connectDB} from "../db/connetDB.js";
import { HumanMessage } from "@langchain/core/messages";
import { Worker } from "bullmq";
import { graph } from "../langraph/Langraph.js";
import { exceutionModel } from "../models/execution.model.js";

await connectDB()

export const worker = new Worker(
    "llm_queue",

    async (job) => {

        const {userId,userInput,threadId,} = job.data;


        await publiser.publish(
            `thread:${threadId}`,
            JSON.stringify({
                jobId: job.id,
                threadId,
                status: "processing",
            })
        );

        const initialState = {userId,threadId,messages: [new HumanMessage(userInput)],

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
                    returnDocument: 'after',
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
                executionTime:finalJob.executionTime,
                iteration:finalJob.iteration
            
            })
        );
    },
    {
        connection: redisConnection,
        concurrency: 1   
    },
    
)

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

