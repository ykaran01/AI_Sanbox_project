import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { SystemMessage, HumanMessage ,AIMessage} from "@langchain/core/messages";
import { systemPrompt ,fixerPrompt} from "./Promt.js";
import { publiser } from "../db/connetDB.js";

const CodeResponseSchema = z.object({
    type: z.enum(["code", "message"]),
    language: z.string(),
    code: z.string(),
    dependencies : z.array(z.string()),
    message: z.string(),
});


const model = new ChatGroq({
    apiKey: process.env.GROCK_TOKEN,
    model: "openai/gpt-oss-120b",
    temperature: 0,
});

const structuredModel = model.withStructuredOutput(CodeResponseSchema);

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
                jobId: state.job.executionId,
            })
        );

        const result = await structuredModel.invoke(messages);

        console.log(result);

        return {
            job: {
                ...state.job,
                type: result.type,
                language: result.language,
                code: result.code,
                dependency: result.dependencies,
                message:result.message

            },

            messages: [
                new AIMessage(result),
            ],
        };

    } catch (error) {
        console.error("LLM Error in invokeModel:", error);

        return {
            job: {
                ...state.job,
                type: "message",
                errorType: "llmError",
            },

            messages: [
                new SystemMessage("Sorry, unable to process the input."),
            ],
        };
    }
};

export const codeFixer = async (state) => {
    try {
        const messages = [
            new HumanMessage(fixerPrompt(state)),
        ];

        await publiser.publish(
            `thread:${state.threadId}`,
            JSON.stringify({
                status: "fixing",
                jobId: state.job.executionId,
            })
        );

        const result = await structuredModel.invoke(messages);

        console.log(result);

        return {
            job: {
                ...state.job,
                code: result.code,
                iteration: state.job.iteration + 1,
                errorMessages: [],
            },

            messages: [
                new SystemMessage(result),
            ],
        };

    } catch (error) {
        console.error("LLM Error in codeFixer:", error);

        return {
            job: {
                ...state.job,
                iteration: state.job.iteration + 1,
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
