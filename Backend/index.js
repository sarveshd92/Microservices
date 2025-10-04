import express from "express"
import cors from "cors"
import dotenv from "dotenv";
import { configurecors } from "./Middlewares/cors.middleware.js";
import router from "./Routes/UserRoute.js";
import { Rate_Limit } from "./Util/rate-limit.js";
import logger from "./Util/Logger.js";
import { db_connect } from "./Util/Db_Connect.js";
dotenv.config()
const app=express();
const port=process.env.PORT || 3000;
app.use(express.json())
// app.use(express.urlencoded({extended:true}))
app.use(cors(configurecors))

app.use(Rate_Limit)
app.use((req,res,next)=>{
    logger.info(`Recieved ${req?.method} request to this url ${req?.url} `)
    logger.info(`Recieved body :  ${req?.body} `)
    next();
})
app.use("/api/auth",router)
app.use((err,req,res,next)=>{
    logger.error('something went wrong',err)
    return res.status(err.statusCode||500).json({
        success:false,
        message:err||'something went wrong',
    })
})

app.listen(port,async ()=>{

  try {
    await db_connect()
      console.log("port is running",port)
  } catch (error) {
    process.exit(1);
  }
})