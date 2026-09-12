
import { Router } from "express";
import { getCode } from "../controllers/code.controller.js";

export const codeRouter = Router()

codeRouter.post('/code',getCode)