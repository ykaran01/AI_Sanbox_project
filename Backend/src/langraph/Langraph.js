import {END,START,StateGraph,Annotation,messagesStateReducer} from "@langchain/langgraph";
import { invokeModel, codeFixer } from "../llm/model.service.js";
import { Sandbox_execution } from "../sandbox/execution.services.js";
import {routeAfterExecution,routeFortheCode} from "../langraph/functions.js";
import {MemorySaver,InMemoryStore,} from "@langchain/langgraph"
import {MongoDBSaver} from  "@langchain/langgraph-checkpoint-mongodb"
import { MongoClient } from "mongodb"
import "dotenv/config"
const client = new MongoClient(process.env.MONGODB_URL)

await client.connect()
const checkpointer = new MongoDBSaver({
    client:client})


const saver = new  InMemoryStore()

const StateAnnotation = Annotation.Root({
    executionId: Annotation(),
    userPrompt : Annotation(),
    threadId:Annotation(),
    userId:Annotation(),
    type: Annotation(),
    messages: Annotation({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    code: Annotation(),
    language: Annotation(),
    result: Annotation(),
    errorMessages: Annotation({
        default: () => [],
    }),
    executionTime: Annotation(),
    dependency : Annotation({
        default:()=>[]
    }),
    success: Annotation(),
    iteration: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => 0,
    }),
    maxiterations: Annotation({
        default: () => 3,
    }),
    errorType:Annotation()
});


const graph = new StateGraph(StateAnnotation)
    .addNode("llm_Calling", invokeModel)
    .addNode("Sandbox_execution", Sandbox_execution)
    .addNode("codeFixer", codeFixer)
    .addEdge(START, "llm_Calling")
    .addConditionalEdges(
        "llm_Calling",
        routeFortheCode,
        {
            message: END,
            code: "Sandbox_execution"
        }
    )
    .addConditionalEdges(
        "Sandbox_execution",
        routeAfterExecution,
        {
            success: END,
            failed: END,
            fix: "codeFixer"
        }
    )
    .addEdge("codeFixer", "Sandbox_execution")
    .compile({checkpointer:checkpointer,store:saver});

export { graph };