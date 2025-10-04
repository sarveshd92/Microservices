import rateLimit from "express-rate-limit";
import RedisStore from 'rate-limit-redis';
import logger from "./Logger.js";
import ApiError from "./APIerror.js";
import Redis from "ioredis";
import dotenv from "dotenv"
dotenv.config()
const redisClient=new Redis({host:process.env.Redis_host,
  port : process.env.Redis_port
})
export const Rate_Limit=rateLimit({
    windowMs:1*60*1000,
    limit:100,
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
  handler:(req,res)=>{
    console.log(req)
    logger.warn("Rate limit exceed for this IP:",req?.ip)
    throw new ApiError(404,"Rate limit exceed for this IP: ",req)
  },
   store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
})
