import mongoose from "mongoose";
import Message from "../models/message";
import {IChatRepository, IDoctorChatSummary, IMessage, IMessageDocument } from "../interfaces/chat/IChatdpRepository";

export class ChatdpRepository implements IChatRepository {
  async saveMessage(message: IMessage): Promise<IMessageDocument> {
    const newMessage = new Message(message);
    const savedMessage = await newMessage.save();
    return savedMessage.toObject() as unknown as IMessageDocument;
  }

  async getMessages(userId: string, doctorId: string): Promise<IMessageDocument[]> {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: doctorId },
        { sender: doctorId, receiver: userId }
      ]
    }).lean(); 
    
    return messages as unknown as IMessageDocument[];
  }

  async getDoctorChatList(doctorId: string): Promise<IDoctorChatSummary[]> {
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

  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const result = await Message.findByIdAndDelete(messageId);
      return result !== null;
    } catch (error: any) {
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }
}