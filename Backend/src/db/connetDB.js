import mongoose from "mongoose";
import  {Redis} from "ioredis"
import "dotenv/config"
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
  maxRetriesPerRequest:null
};

export const redisConnection = new Redis(redisConfig);

export const publiser = new Redis(redisConfig)

export const subscriber = new Redis(redisConfig)
