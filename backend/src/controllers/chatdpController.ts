import { Request, Response } from "express";
import { ChatdpService } from "../services/chatdpservices";
import { HttpMessage, HttpStatus } from '../enums/HttpStatus';
import notificationService from "../services/notificationService";
import { DoctorRepository } from "../repositories/doctorRepository";
import UserRepository from "../repositories/userRepository";


export class ChatdpController {
  constructor(private readonly chatService: ChatdpService) {}

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sender, receiver, text } = req.body;
      const imageUrl = req.body.imageUrl;
  
      if (!sender || !receiver) {
        throw new Error("Sender and receiver IDs are required");
      }
  
      // Identify recipient role
      let recipientRole: "user" | "doctor";
  
      const userRepo = UserRepository.getInstance();
      const user = await userRepo.findById(receiver);
      if (user) {
        recipientRole = "user";
      } else {
        const doctorRepo = new DoctorRepository();
        const doctor = await doctorRepo.findById(receiver);
        if (doctor) {
          recipientRole = "doctor";
        } else {
          throw new Error("Receiver not found in user or doctor records");
        }
      }
  
      // Determine sender name (for notification message)
      let senderName: string = "Someone";
  
      const senderUser = await userRepo.findById(sender);
      if (senderUser) {
        senderName = senderUser.name;
      } else {
        const doctorRepo = new DoctorRepository();
        const senderDoctor = await doctorRepo.findById(sender);
        if (senderDoctor) {
          senderName = senderDoctor.name;
        }
      }
  
      // Create notification with sender's name
      const notification = await notificationService.createNotification({
        recipientId: receiver,
        recipientRole: recipientRole,
        message: `New message from ${senderName}`,
      });
  
      req.io?.to(receiver).emit("newNotification", notification);
  
      const message = await this.chatService.sendMessage(sender, receiver, text, imageUrl);
      res.status(HttpStatus.CREATED).json(message);
    } catch (error: unknown) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
    }
  }
  
  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, doctorId } = req.params;
      const messages = await this.chatService.getChatHistory(userId, doctorId);
      res.status(HttpStatus.OK).json(messages);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message:HttpMessage.BAD_REQUEST});
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message:HttpMessage.BAD_REQUEST});
      }
    }
  }

  async getDoctorChatList(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId } = req.params;
      const chatList = await this.chatService.getDoctorChatList(doctorId);
      res.status(HttpStatus.OK).json(chatList);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message:HttpMessage.BAD_REQUEST});
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message:HttpMessage.BAD_REQUEST});
      }
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const result = await this.chatService.deleteMessage(messageId);
      if (result) {
        res.status(HttpStatus.OK).json({ message: HttpMessage.OK });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ error: HttpMessage.NOT_FOUND });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
    }
  }
}