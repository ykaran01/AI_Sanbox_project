import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/Apierror.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { exceutionModel } from "../models/execution.model.js";
import { puttingInputInQueue } from "../Queue/bullmq.js";
import mongoose from "mongoose";

export const getCode = asyncHandler(async (req, res) => {

    const { userInput ,threadId} = req.body;
    if (!userInput || typeof userInput !== "string") {

        throw new ApiError(
            400,
            "userInput is required"
        );

    }
    // const userId = req.user._id;
    
    // if (!userId) {
    //     throw new ApiError(
    //         401,
    //         "User is not authenticated"
    //     );

    // }
    const jobId = await puttingInputInQueue({
        userId:"6aa97e2d6538bf59ec07f998",
        userInput,
        threadId
    }); 
    return res.status(202).json(
        new ApiResponse(
            202,
            {
            executionId: jobId,
            },
            "Code execution started"
        )
    );

});

export const getHistory = asyncHandler(async(req,res)=>{
    const threadId = req.params.threadId
  
    if(!threadId ||  threadId==""){
        throw ApiError(404,"Thraed ID not found")
    }
    // const userId =  req.user
    const result = await exceutionModel.aggregate([
        {
            $match:{
                threadId:threadId,
                // userId:userId,
            }
        },
        {
            $project:{
                _id:0,
                jobId:"$executionId",
                user:"$userprompt",
                type:1,
                code:1,
                agent:"$messages",
                language:1,
                result:1,
                createdAt:1

            }
        },
        {
            $sort:{
                createdAt:1
            }
        }

    ])
    
    return res.status(200).json(new ApiResponse(200,result,"Data of the perticular thread"))

})

export const getUserChatData =  asyncHandler(async(req,res)=>{
    
    const userId = new mongoose.Types.ObjectId(
    "6aa97e2d6538bf59ec07f998"
);
    // const userId =  new mongoose.Types.ObjectId(req.user)
    if(!userId){
        throw new ApiError(404,"the userId do not found")
    }
    
    const data  = await  exceutionModel.aggregate([
        {
            $match:{
                userId:userId
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $group:{
                _id: "$threadId",
                userprompt:{$first:"$userprompt"},
                threadId:{$first:"$threadId"}

            }
        },
        {
            $project:{
                _id:0,
                userprompt:1,
                threadId:1
            }
        }
    ])
   
    console.log(data)
    return res.status(200).json(
        new ApiResponse(200,data,"user Chat data")
    )


})
