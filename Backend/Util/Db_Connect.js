import mongoose, { MongooseError } from "mongoose";
import ApiError from "./APIerror.js";
import logger from "./Logger.js";

export const db_connect=async()=>{
    try {
         await mongoose.connect(process.env.MongoDb_URL)
         logger.info('Mongoose Connected')
    } catch (error) {
        logger.error("mongoose not connected",error)
        throw new ApiError(500,"Mongoose not connected")
    }
}