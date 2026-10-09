import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { exceutionModel } from "../models/execution.model.js";


export const metrisData = asyncHandler(async(req,res)=>{

    const total=  await exceutionModel.countDocuments()
    const success = await exceutionModel.countDocuments({success:true})
    const failed =  total - success
    const [stats]= await exceutionModel.aggregate([
        {
            $group: {
            _id:null,
            averageExecution: { $avg: "$executionTime" }, averageAttempts: { $avg: "$iteration" }
        }
    }
    ])
    const numMessage =  await exceutionModel.countDocuments({type:"message"})
    const numCode =  total -  numMessage

    return res.status(200).json(new ApiResponse(200,{total,
        success,
        failed,
        averageExecution:stats?.averageExecution ?? 0,
        averageattemps:stats?.averageAttempts ?? 0 ,
        numMessage,
        numCode}))

})