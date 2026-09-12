import { getStructuredOutput } from "./model.service.js";
import { systemPrompt2 } from "./Promt.js";

const result = await getStructuredOutput([
    { role: "system", content: systemPrompt2 },
    { role: "user", content: "Run this js to fetch the user from the github api " }
]);

console.log(result);