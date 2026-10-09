import {RateLimiterRedis}  from "rate-limiter-flexible"
import { redisConnection } from "../db/connetDB.js"

const limiter =  new RateLimiterRedis({
    storeClient:redisConnection,
    keyPrefix:"rate-limiter",
    points:60,
    duration:60
})

export const rate_limiter =  async(req,res,next)=>{
    try{
        await limiter.consume(req.ip)
        next()
    }catch(err){
        return res.status(429).josn({message:"Too may request"})
    }
}
