import { graph } from "../langraph/Langraph.js";
import { HumanMessage } from "@langchain/core/messages";
const intial = {
     userPrompt :"createe adding or two variable in javascript and run it",
    messages:[new HumanMessage("createe adding or two variable in javascript and run it")],
    maxiterations:2
}

const result  =  await graph.invoke(intial)
console.log(result)

