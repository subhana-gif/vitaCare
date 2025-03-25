// src/config/index.ts
export default {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY as string,
      modelName: "gemini-1.5-flash",
    },
  };