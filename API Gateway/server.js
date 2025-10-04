import express from "express";
import helmet from "helmet"
import cors from "cors"
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import {RedisStore} from "rate-limit-redis"
import Redis from "ioredis";
import logger from "./Utils/Logger_api.js";
import proxy from "express-http-proxy";

const app = express();
dotenv.config()

app.use(cors())
app.use(helmet())
app.use(express.json());

const redisClient = new Redis({
    host: process.env.Redis_host,
    port: process.env.Redis_port
})

// Custom ApiError class (add this if not imported from elsewhere)


export const Rate_Limit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes (was 6 seconds before)
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
    handler: (req, res) => {
        logger.warn("Rate limit exceeded for IP:", req?.ip);
        return res.status(429).json({
            success: false,
            message: "Rate limit exceeded for this IP"
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
})

app.use(Rate_Limit)

app.use((req, res, next) => {
    logger.info(`Received ${req?.method} request to URL ${req?.url}`);
    logger.info(`Received body: ${JSON.stringify(req?.body)}`);
    next();
})

const port = process.env.PORT || 3000

const proxyOptions = {
    limit: '5mb',
    proxyReqPathResolver: function (req) {
        // Fixed typo: originalUrl instead of orignalUrl
        const original = req.originalUrl.replace(/^\/v1/, "/api");
        console.log("Original URL:", req.originalUrl);
        console.log("Changed URL:", original);
        return original;
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error: ${err?.message}`);
        console.error(`Proxy error: ${err?.message}`);
        return res.status(500).json({ 
            success: false, 
            message: `Proxy error: ${err?.message}` 
        });
    },
}

app.use('/v1/auth/login', proxy(process.env.Login_Microservice, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        return proxyReqOpts;
    },
    userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
        console.log(`Response received from login microservice: ${proxyRes.statusCode}`);
        return proxyResData;
    },
}))

app.use('/v1/get', (req, res) => {
    res.json({ message: "API Gateway" })
})

app.use((err, req, res, next) => {
    logger.error('Something went wrong:', err);
    return res.status(err.statusCode || 500).json({
        success: false,
        message: err?.message || 'Something went wrong',
    })
})

app.listen(port, () => {
    logger.info(`API Gateway is running on port ${port}`);
    logger.info(`Login Microservice URL: ${process.env.Login_Microservice}`);
    console.log(`API Gateway is running on port ${port}`);
})