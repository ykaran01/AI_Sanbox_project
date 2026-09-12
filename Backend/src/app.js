import express from 'express'
import cors from 'cors'
export const app = express()


app.use(express.json())

app.use(cors({
    origin : "https://www.thunderclient.com",
    
}))



import { codeRouter } from './route/code.route.js'
import { userRouter } from './route/user.route.js'
app.use('/api',codeRouter)
app.use('/api/user',userRouter)


app.get('/api/hello',(req,res)=>{
    return res.status(200).json(
        {
            message:"Hlw how are are"
        }
    )
})

