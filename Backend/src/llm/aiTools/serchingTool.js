import {z} from 'zod'
import {tool} from '@langchain/core/tools'
import * as cheerio from "cheerio";

export const seachTool = tool(
    async ({url})=>{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(`HTTP error ${response.status}`)

        }
        const type =  response.headers.get("content-type") || ""
        if(type.includes(type)){
            return response.json()
        }
        return response.text()
    },{
        name:"SeachTool",
        description:"This fetches the information from the url and return the result",
        schema:z.object({
            url: z.string().url().describe('This is the url of the perticular website')
        })
    }
)

export const webScraperTool = tool(
    async ({ url }) => {
        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();

            const $ = cheerio.load(html);

          
            $("script, style, noscript, iframe").remove();

            const title = $("title").text().trim();

            const text = $("body")
                .text()
                .replace(/\s+/g, " ")
                .trim();

            return JSON.stringify({
                url,
                title,
                content: text.slice(0, 15000)
            });

        } catch (error) {
            return JSON.stringify({
                error: error.message
            });
        }
    },
    {
        name: "WebScraper",
        description:
            "Fetches a publicly accessible webpage and extracts its readable text content. Use this when the user provides a URL and asks for information from that webpage.",
        schema: z.object({
            url: z.string().url().describe("The publicly accessible webpage URL")
        })
    }
);


