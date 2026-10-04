
import { Router } from "express";
import { deleteChat, getCode, getHistory ,getUserChatData} from "../controllers/code.controller.js";
import { userMiddleware  } from "../middleware/user.middleware.js";
export const codeRouter = Router()

codeRouter.use(userMiddleware)

codeRouter.post('/code',getCode)

codeRouter.get('/code/:threadId',getHistory)

codeRouter.get('/code',getUserChatData)

codeRouter.delete('/code',deleteChat)