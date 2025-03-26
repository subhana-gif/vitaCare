import { Request, Response } from "express";
import { GeminiService } from "../services/geminiService";

export class ChatController {
  constructor(private readonly geminiService: GeminiService) {}

  async handleChatRequest(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      
      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const response = await this.geminiService.generateResponse(message);
      res.json({ response });
    } catch (error) {
      console.error("ChatController Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}