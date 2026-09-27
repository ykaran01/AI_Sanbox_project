import { END, START, StateGraph, Annotation, messagesStateReducer } from "@langchain/langgraph";
import { invokeModel, codeFixer } from "../llm/model.service.js";
import { Sandbox_execution } from "../sandbox/execution.services.js";
import { routeAfterExecution, routeFortheCode } from "../langraph/functions.js";
import { InMemoryStore, } from "@langchain/langgraph"
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb"
import { MongoClient } from "mongodb"
import "dotenv/config"
const client = new MongoClient(process.env.MONGODB_URL)

await client.connect()
const checkpointer = new MongoDBSaver({
    client: client
})


const saver = new InMemoryStore()

const StateAnnotation = Annotation.Root({
    threadId: Annotation(),
    userId: Annotation(),
    messages: Annotation({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    job: Annotation({
    reducer: (_, newRecord) => newRecord,
    default: () => ({
        executionId: null,
        userPrompt: "",
        type: "",
        code: "",
        language: "",
        result: "",
        message:"",
        errorMessages: [],
        executionTime: 0,
        dependency: [],
        success: false,
        iteration: 0,
        maxiterations: 3,
        errorType: null,
    }),
}),

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
    .compile({ checkpointer: checkpointer, store: saver });

export { graph };