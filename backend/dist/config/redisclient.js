"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    socket: {
        host: "127.0.0.1",
        port: 6379,
    },
});
redisClient.on("error", (err) => console.error("Redis Error:", err));
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis ");
    }
    catch (error) {
        console.error("Failed to connect to Redis ", error);
    }
};
connectRedis();
exports.default = redisClient;
