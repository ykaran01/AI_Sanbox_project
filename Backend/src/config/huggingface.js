import {InferenceClient} from '@huggingface/inference'
export const client = new InferenceClient("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")



const response = await client.chatCompletion({
  model: "Qwen/Qwen2.5-Coder-7B-Instruct",

  messages: [
    {
      role: "system",
      content: `
You are a coding assistant.

Return ONLY valid JSON.
The JSON must follow this structure:

{
  "language": "java",
  "code": "string",
  "explanation": "string"
}
      `
    },
    {
      role: "user",
      content: "Write a Java program to reverse a string."
    }
  ],

  max_tokens: 500,
  temperature: 0
});

const content = response.choices[0].message.content;

console.log(content);

const result = JSON.parse(content);

console.log(result.language);
console.log(result.code);
console.log(result.explanation);