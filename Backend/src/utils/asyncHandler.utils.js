

export const asyncHandler = (fn) => async (req,res,next) =>{

    try{
       return  await fn(req,res,next);
    }

    catch(err){
        return res.status(err.status || 500).json({
            status: 'error',
            message: err.message,
            success :false
        })
    }
} 