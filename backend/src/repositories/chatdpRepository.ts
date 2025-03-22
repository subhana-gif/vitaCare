import mongoose from "mongoose";
import Message from "../models/message";

class ChatRepository {
  async saveMessage(sender: string, receiver: string, text: string, media: string | null) {
    const message = new Message({ sender, receiver, text, media });
    return await message.save();
  }

  async getMessages(userId: string, doctorId: string) {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: doctorId },
        { sender: doctorId, receiver: userId }
      ]
    }).sort({ createdAt: 1 }).lean(); // Add .lean() to optimize query
  
    return messages;
  }
  
  async getDoctorChatList(doctorId: string) {
    const chatList = await Message.aggregate([
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
      { $project: { _id: 1, lastMessage: 1, "userDetails.name": 1, "userDetails.email": 1 } }
    ]);
    return chatList;
  }
  
}

export default new ChatRepository();
