import GeminiRepository from "../repositories/geminiRepository";

class GeminiService {
  private geminiRepo: GeminiRepository;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY as string;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
    this.geminiRepo = new GeminiRepository(apiKey);
  }

  async generateResponse(message: string): Promise<string> {
    try {
      return await this.geminiRepo.getResponse(message);
    } catch (error) {
      console.error("Gemini Service Error:", error);
      return "I'm sorry, I couldn't process that request.";
    }
  }
}

export default new GeminiService();
