import { BrevoClient } from "@getbrevo/brevo";
import "dotenv/config";

export const breavo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});