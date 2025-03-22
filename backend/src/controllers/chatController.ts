import { Request, Response } from "express";
import GeminiService from "../services/geminiService";

export const chatController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const response = await GeminiService.generateResponse(message);
    res.json({ response });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
