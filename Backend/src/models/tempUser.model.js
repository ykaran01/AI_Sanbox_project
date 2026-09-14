import mongoose from "mongoose";
const tempUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
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

    }, username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
    },
    refreshToken: {
        type: String,
    },
    verifyOTP: {
        type: Number
    },
    expireOTP: {
        type: Date,
    }

},{timestamps:true})


tempUserSchema.index({createdAt:1},
    {expireAfterSeconds:4*60}
)

export const tempUserModel = mongoose.model('tempUser',tempUserSchema)