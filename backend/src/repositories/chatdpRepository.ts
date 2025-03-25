// src/repositories/chatRepository.ts
import mongoose from "mongoose";
import Message from "../models/message";
import {IChatRepository, IMessage, IMessageDocument } from "../repositories/IChatdpRepository";

export class ChatdpRepository implements IChatRepository {
  async saveMessage(message: IMessage): Promise<IMessageDocument> {
    try {
      const newMessage = new Message(message);
      return await newMessage.save();
    } catch (error:any) {
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  async getMessages(userId: string, doctorId: string): Promise<IMessageDocument[]> {
    try {
      return await Message.find({
        $or: [
          { sender: userId, receiver: doctorId },
          { sender: doctorId, receiver: userId }
        ]
      }).sort({ createdAt: 1 }).lean();
    } catch (error:any) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }
  }

  async getDoctorChatList(doctorId: string): Promise<any[]> {
    try {
      return await Message.aggregate([
        { $match: { receiver: new mongoose.Types.ObjectId(doctorId) } },
        { $group: { _id: "$sender", lastMessage: { $last: "$text" } } },
        { 
          $lookup: { 
            from: "users", 
            localField: "_id", 
            foreignField: "_id", 
            as: "userDetails" 
          } 
        },
        { $unwind: "$userDetails" },
        { $project: { 
            _id: 1, 
            lastMessage: 1, 
            "userDetails.name": 1, 
            "userDetails.email": 1 
          } 
        }
      ]);
    } catch (error:any) {
      throw new Error(`Failed to get doctor chat list: ${error.message}`);
    }
  }
}