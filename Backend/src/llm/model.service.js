import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { systemPrompt } from "./Promt.js";

const CodeResponseSchema = z.object({
    type: z.enum(["code", "message"]),
    language: z.string(),
    code: z.string(),
    message: z.string(),
});


const model = new ChatOllama({
    model: "qwen2.5-coder:3b",
    temperature: 0,
    
});


const structuredModel = model.withStructuredOutput(CodeResponseSchema);

export const invokeModel = async (state) => {
    try {
        const messages = [
            new SystemMessage(systemPrompt),
            ...state.messages,
        ];

        const result = await structuredModel.invoke(messages);
        console.log(result)
        return {
            type: result.type,
            language: result.language,
            code: result.code,
            messages: [
                  new SystemMessage(result.message)
            ],
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
        const lastError = state.errorMessages[state.errorMessages.length - 1] || "Unknown error";
        const fixInstruction = `
        You are an expert debugger. The previous ${state.language} code execution failed.
        Here is the code you wrote:
        \`\`\`${state.language}
        ${state.code}
        \`\`\`

        Here is the error message returned from the compiler/runtime:
        ${lastError}

        Fix the code to resolve this error. Ensure your explanation is concise in the "message" field.`;

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(fixInstruction)
        ];

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