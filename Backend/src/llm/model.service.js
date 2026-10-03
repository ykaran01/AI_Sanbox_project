
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import {
    SystemMessage,
    HumanMessage,
    AIMessage,
} from "@langchain/core/messages";

import { systemPrompt, fixerPrompt } from "./Promt.js";
import { publiser } from "../db/connetDB.js";


const CodeResponseSchema = z.object({
    type: z.enum(["code", "message"]),

    language: z.string(),

    code: z.string(),

    dependencies: z.array(z.string()),

    stdin: z.string(),

    message: z.string(),
});
const model = new ChatGroq({
    apiKey: process.env.GROCK_TOKEN,
    model: "openai/gpt-oss-120b",
    temperature: 0,
});


const structuredModel = model.withStructuredOutput(
    CodeResponseSchema
);

const normalizeCode = (code) => {
    if (typeof code !== "string") {
        return "";
    }

    return code
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\n");
};


const normalizeStdin = (stdin) => {
    if (typeof stdin !== "string") {
        return "";
    }

    return stdin
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\n");
};


export const invokeModel = async (state) => {
    try {
        const messages = [
            new SystemMessage(systemPrompt),
            ...state.messages,
        ];


        await publiser.publish(
            `thread:${state.threadId}`,
            JSON.stringify({
                status: "generating",
                threadId:state.threadId,
                jobId: state.job.executionId,
            })
        );


        const result = await structuredModel.invoke(messages);


        console.log("LLM RESULT:");
        console.log(result);

        console.log("CODE:");
        console.log(result.code);

        console.log("CODE JSON:");
        console.log(JSON.stringify(result.code));


        const code = normalizeCode(result.code);
        const stdin = normalizeStdin(result.stdin);


        console.log("NORMALIZED CODE:");
        console.log(code);

        console.log("NORMALIZED CODE JSON:");
        console.log(JSON.stringify(code));


        return {
            job: {
                ...state.job,

                type: result.type,

                language: result.language,

                code: code,

                dependencies: result.dependencies,

                stdin: stdin,

                message: result.message,
            },

            messages: [
                new AIMessage({
                    content: result.message,
                }),
            ],
        };

    } catch (error) {

        console.error(
            "LLM Error in invokeModel:",
            error
        );

        return {
            job: {
                ...state.job,

                type: "message",

                errorType: "llmError",
            },

            messages: [
                new SystemMessage(
                    "Sorry, unable to process the input."
                ),
            ],
        };
    }
};


export const codeFixer = async (state) => {
    try {

        const messages = [
            new SystemMessage(
                fixerPrompt(state)
            ),
        ];


        await publiser.publish(
            `thread:${state.threadId}`,
            JSON.stringify({
                status: "fixing",
                threadId:state.threadId,
                jobId: state.job.executionId,
            })
        );


        const result = await structuredModel.invoke(
            messages
        );
        const code = normalizeCode(result.code);


        console.log("NORMALIZED FIXED CODE:");


        return {
            job: {
                ...state.job,

                code: code,

                iteration:
                    state.job.iteration + 1,

                errorMessages: [],
            },

            messages: [
                new AIMessage({
                    content: result.message || "Code fixed.",
                }),
            ],
        };

    } catch (error) {

        console.error(
            "LLM Error in codeFixer:",
            error
        );

        return {
            job: {
                ...state.job,

                iteration:
                    state.job.iteration + 1,

                errorType: "fixerError",
            },

            messages: [
                new SystemMessage(
                    "I encountered an error while trying to generate a fix for the code."
                ),
            ],
        };
    }
};





