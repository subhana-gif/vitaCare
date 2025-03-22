import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiRepository {
  private model;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async getResponse(message: string): Promise<string> {
    const result = await this.model.generateContent(message);
    if (!result || !result.response || !result.response.text()) {
      throw new Error("Invalid Gemini API response");
    }
    return result.response.text();
  }
}

export default GeminiRepository;
