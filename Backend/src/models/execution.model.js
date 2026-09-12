import mongoose from "mongoose";

const executionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    executionId: {
        type: String,
        required: true
    },

    language: String,

    code: String,

    result: String,
    
    messages:[String],

    errorMessages: [String],

    success: Boolean,

    exitCode: Number,

    executionTime: Number,

    iteration: Number,

    maxIterations: Number

}, { timestamps: true });

export const exceutionModel = mongoose.model("execute",executionSchema)