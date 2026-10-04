import mongoose from "mongoose"


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,

    },
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
    },
    refreshToken: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    
}, { timestamps: true })


export const  User = mongoose.model("User", userSchema)