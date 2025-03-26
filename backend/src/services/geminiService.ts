import { IAIRepository } from "../interfaces/gemini/IAIRepository";

export class GeminiService {
  constructor(private readonly aiRepository: IAIRepository) {}

  async generateResponse(message: string): Promise<string> {
    try {
      if (!message.trim()) {
        throw new Error("Message cannot be empty");
      }
      return await this.aiRepository.getResponse(message);
    } catch (error) {
      console.error("GeminiService Error:", error);
      return "I'm sorry, I couldn't process that request.";
    }
  }
}