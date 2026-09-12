import { graph } from "../langraph/Langraph.js";
import { HumanMessage } from "@langchain/core/messages";
const intial = {
    messages:[new HumanMessage('create linkedlist in c using oops concept')]
}

const result  =  await graph.invoke(intial)
console.log(result)

