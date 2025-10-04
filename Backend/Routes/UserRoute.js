import express from "express"
import asynchandler from "../Util/asynchandler.js";
import ApiError from "../Util/APIerror.js";
import logger from "../Util/Logger.js";
import { login, register } from "../Controller/user.controller.js";
import { createValidator } from "express-joi-validation";
import Joi from '@hapi/joi';
import Auth from "../Middlewares/Auth.Middleware.js";
const validator = createValidator();
const registerParamsCheck=Joi.object({
    name: Joi.string().required(),
    email:Joi.string().email().required(),
    password:Joi.string().pattern(new RegExp('^(?=.*[!@#$%^&*])')) // at least one special char
    .min(8) 
    .required()
    .messages({
      "string.pattern.base": "Password must contain at least one special character (!@#$%^&*)",
      "string.min": "Password must be at least 8 characters long"
    })
})
const UserRoute=express.Router();
UserRoute.get("/login",(asynchandler((req,res)=>{
logger.info('inside /login')

 return res.status(200).json({
        success:true,
        message:"from auth route to login controller "
    })

})))
UserRoute.post('/login',login)
UserRoute.post('/register',validator.body(registerParamsCheck),register)
UserRoute.post('/home',Auth)

export default UserRoute;