import { Queue} from "bullmq";
import { exceutionModel } from "../models/execution.model.js";
import { redisConnection, publiser } from "../db/connetDB.js";



const llmQueue = new Queue("llm_queue", {
    connection: redisConnection,
});

export const puttingInputInQueue = async (input) => {

    const {userId,userInput,threadId} = input;

    const job = await llmQueue.add(
        "userInput",
        { userId,userInput,threadId,
        }
        ,{
            attempts:3,
            backoff:{
                type:"exponential",
                delay:1000
            },
        removeOnComplete:100,
        removeOnFail:50,
        }
    );
    await publiser.publish(
            `thread:${threadId}`,
            JSON.stringify({
                jobId: job.id,
                threadId,
                status: "queued",
            })
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



