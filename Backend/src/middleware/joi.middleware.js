import Joi from "joi";
import { ApiError } from "../utils/Apierror.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";

const schema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
  username: Joi.string().min(2).max(20).required(),
});

export const joiMiddleware = asyncHandler((req, res, next) => {
  const { error, value } = schema.validate(req.body);
    

  if (error) {
     throw new ApiError(400, error.details[0].message);
  }

  req.body = value; 
  next();
});
