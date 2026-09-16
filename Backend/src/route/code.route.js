
import { Router } from "express";
import { getCode } from "../controllers/code.controller.js";
import { userMiddleware } from "../middleware/user.middleware.js";
export const codeRouter = Router()

codeRouter.post('/code',getCode)