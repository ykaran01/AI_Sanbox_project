import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
export const app = express()
import { connectDB } from './db/connetDB.js'
await connectDB()
// import "../src/Queue/worker.js"
import "../workerManager.js"
app.use(express.json())

app.use(cors({
    origin : "http://localhost:5173",
    credentials:true
    
}))
app.use(cookieParser())

import { codeRouter } from './route/code.route.js'
import { userRouter } from './route/user.route.js'

app.use('/api',codeRouter)
app.use('/api/user',userRouter)


app.get('/api/hello',(req,res)=>{
    return res.status(200).json(
        {
            message:"Hlw how are you"
        }
    )
})

