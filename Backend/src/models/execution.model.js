
import mongoose from "mongoose";

const executionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["message", "code", ""],
            default: "",
        },
        executionId: { 
            type: String,
            required: true,
            index: true,
        },

        threadId:{
            type: String,
            required: true,
            index: true
        },
        language: {
            type: String,
            enum: [
                "javascript",
                "python",
                "java",
                "c",
                "cpp",
                "",
            ],
            default: "",
        },

        code: {
            type: String,
            default: "",
        },
        result: {
            type: String,
            default: "",
        },

        messages: {
            type: [
                {
                    type: {
                        type: String,
                        enum: ["human", "ai", "system", "tool"],
                    },
                    content: {
                        type: String,
                        default: "",
                    },
                },
            ],
            default: [],
        },
        
        success: {
            type: Boolean,
            default: false,
        },

        executionTime: {
            type: Number,
            default: 0,
        },

        iteration: {
            type: Number,
            default: 0,
        },

        error: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const exceutionModel = mongoose.model(
    "Execution",
    executionSchema
);
