import { Request, Response } from "express";
import { GeminiService } from "../services/geminiService";
import { HttpMessage, HttpStatus } from '../enums/HttpStatus';


export class ChatController {
  constructor(private readonly geminiService: GeminiService) {}

  async handleChatRequest(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      
      if (!message) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Message is required" });
        return;
      }

      const response = await this.geminiService.generateResponse(message);
      res.json({ response });
    } catch (error) {
      console.error("ChatController Error:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: HttpMessage.INTERNAL_SERVER_ERROR });
    }
  }
}