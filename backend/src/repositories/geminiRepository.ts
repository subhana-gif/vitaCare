// src/repositories/geminiRepository.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAIRepository } from "../repositories/IAIRepository";
import config from "../config/gemini";

export class GeminiRepository implements IAIRepository {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = genAI.getGenerativeModel({ model: config.gemini.modelName });
  }

  async getResponse(message: string): Promise<string> {
    try {
      const result = await this.model.generateContent(message);
      const response = result.response.text();
      if (!response) {
        throw new Error("Empty response from AI model");
      }
      return response;
    } catch (error) {
      console.error("GeminiRepository Error:", error);
      throw new Error("Failed to get AI response");
    }
  }
}