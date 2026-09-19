import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
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
        await publiser.publish(`job:${state.executeId}`,JSON.stringify({status:"generating"}))
        const result = await structuredModel.invoke(messages);
        console.log(result)
        return {
            type: result.type,
            language: result.language,
            code: result.code,
            messages: [
                new SystemMessage(result.message)
            ],
            dependency:result.dependencies
        };
    } catch (error) {
        console.error("LLM Error in invokeModel:", error);

        return {
            type: "message",
            messages: [
                new SystemMessage("Sorry Unable code the input")
            ],
        };
    }
};



export const codeFixer = async (state) => {
    try {
        const messages = [
            new HumanMessage(fixerPrompt(state))
        ];
        await publiser.publish(`thread:${state.threadId}`,JSON.stringify({status:"fixing",jobId:state.executionId}))
        const result = await structuredModel.invoke(messages);
        console.log(result)
        return {
            code: result.code,
            iteration: state.iteration + 1,
            messages: [
                new SystemMessage(`Attempting fix iteration ${state.iteration + 1}: ${result.message}`)
            ],
        };
    } catch (error) {
        console.error("LLM Error in codeFixer:", error);

        return {
            iteration: state.iteration + 1,
            messages: [
                new SystemMessage("I encountered an error while trying to generate a fix for the code.")
            ],
        };
    }
};
