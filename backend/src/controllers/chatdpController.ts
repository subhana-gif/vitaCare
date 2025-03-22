import { Request, Response } from "express";
import ChatService from "../services/chatdpservices";
import chatdpRepository from "../repositories/chatdpRepository";

class ChatController {
  async sendMessage(req: Request, res: Response) {
    const { sender, receiver, text } = req.body;
    const media = req.body.imageUrl || null; 

    const message = await ChatService.sendMessage(sender, receiver, text, media);
    res.status(201).json(message);
}

  async getChatHistory(req: Request, res: Response) {
    const { userId, doctorId } = req.params;
    const messages = await ChatService.getChatHistory(userId, doctorId);
    res.status(200).json(messages);
  }

  async getDoctorChatList(req: Request, res: Response) {
    const { doctorId } = req.params;
    const chatList = await chatdpRepository.getDoctorChatList(doctorId);
    res.status(200).json(chatList);
  }
}

export default new ChatController();
