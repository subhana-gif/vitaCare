import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

redisClient.on("error", (err: Error) => console.error("Redis Error:", err));

const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis ");
  } catch (error) {
    console.error("Failed to connect to Redis ", error);
  }
};

connectRedis();

export default redisClient;
