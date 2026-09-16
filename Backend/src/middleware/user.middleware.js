import {asyncHandler} from '../utils/asyncHandler.utils.js'
import { ApiError } from '../utils/Apierror.utils.js';
import  jwt from 'jsonwebtoken'

export const userMiddleware = asyncHandler(async(req,res,next)=>{
    const  token =  req.cookies?.accessToken;
    if(!token){
        throw new ApiError(401,"Access token not found")
    }
    const user =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    if(!user){
          throw new ApiError(401,"Unauthorised") 
    }
    
    req.user =  user;
    next()
})