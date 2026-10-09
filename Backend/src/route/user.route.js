import {Router} from 'express'
import { loginUser, registerUser, verifyUser ,getUser, refresh, changeName, logout, changepassword, sendingOTP, verifying } from '../controllers/user.controller.js'
import { userMiddleware , adminMiddlware} from '../middleware/user.middleware.js'
import { joiMiddleware } from '../middleware/joi.middleware.js'
import { rate_limiter } from "../middleware/ratelimiter.middleware.js";
import {metrisData} from "../controllers/admin.contoller.js"
const userRouter = Router()

userRouter.use(rate_limiter)

userRouter.post('/register',joiMiddleware,registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/otp',verifyUser)
userRouter.get('/me',userMiddleware,getUser)
userRouter.post('/refresh',refresh)
userRouter.patch('/name',userMiddleware,changeName)
userRouter.post('/logout',userMiddleware,logout)
userRouter.post('/change',changepassword)
userRouter.post('/send',sendingOTP)
userRouter.post('/verify',verifying)

userRouter.get('/',adminMiddlware,metrisData)

export {userRouter}