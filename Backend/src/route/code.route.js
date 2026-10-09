
import { Router } from "express";
import { deleteChat, getCode, getHistory ,getUserChatData} from "../controllers/code.controller.js";
import { userMiddleware  } from "../middleware/user.middleware.js";
import { rate_limiter } from "../middleware/ratelimiter.middleware.js";
export const codeRouter = Router()

codeRouter.use(rate_limiter)

codeRouter.post('/code',userMiddleware,getCode)

codeRouter.get('/code/:threadId',userMiddleware,getHistory)

codeRouter.get('/code',userMiddleware,getUserChatData)

codeRouter.delete('/code',userMiddleware,deleteChat)