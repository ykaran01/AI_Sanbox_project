import {Router} from 'express'
import { loginUser, registerUser, verifyUser ,getUser, refresh, changeName, logout } from '../controllers/user.controller.js'
import { userMiddleware } from '../middleware/user.middleware.js'
import { joiMiddleware } from '../middleware/joi.middleware.js'
const userRouter = Router()

userRouter.post('/register',joiMiddleware,registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/otp',verifyUser)
userRouter.get('/me',userMiddleware,getUser)
userRouter.post('/refresh',refresh)
userRouter.patch('/name',userMiddleware,changeName)
userRouter.post('/logout',userMiddleware,logout)

export {userRouter}