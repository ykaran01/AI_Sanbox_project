import mongoose from "mongoose";

import  {Redis} from "ioredis"


export const connectDB =  async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database is Connected")
    }catch(err){
        console.log(`Connection problem ${err.message}`)
        process.exit(0)

    }
}

const redisConfig = {
  port: 6379,
  host: '127.0.0.1',
};

export const redisConnection = new Redis(redisConfig);
