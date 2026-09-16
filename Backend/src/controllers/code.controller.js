import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/Apierror.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";

import { puttingInputInQueue } from "../Queue/bullmq.js";


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