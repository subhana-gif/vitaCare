import { IChatRepository, IMessage, IMessageDocument, IDoctorChatSummary } from "../interfaces/chat/IChatdpRepository";
import { DoctorRepository } from "../repositories/doctorRepository";
import notificationService from "./notificationService";
import UserRepository from "../repositories/userRepository";

export class ChatdpService {
  constructor(private readonly chatRepository: IChatRepository) {}


  async sendMessage(
    sender: string,
    receiver: string,
    text?: string,
    media?: string,
    callData?: {
      type?: "image" | "video" | "call";
      status?: "Missed" | "Not Answered" | "Completed";
      callDuration?: number;
      createdAt?: Date;
    }
  ): Promise<IMessageDocument> {
    if (!sender || !receiver) {
      throw new Error("Sender and receiver are required");
    }
    const message: Partial<IMessage> = {
      sender,
      receiver,
      ...(text && { text }),
      ...(media && { media }),
      ...(callData && {
        type: callData.type,
        status: callData.status,
        callDuration: callData.callDuration,
        createdAt: callData.createdAt || new Date(),
      }),
    };



    return this.chatRepository.saveMessage(message as IMessage);
  }

  // ... other methods remain unchanged
  async getChatHistory(userId: string, doctorId: string): Promise<IMessageDocument[]> {
    if (!userId || !doctorId) {
      throw new Error("Both user ID and doctor ID are required");
    }
    return this.chatRepository.getMessages(userId, doctorId);
  }

  async getDoctorChatList(doctorId: string): Promise<IDoctorChatSummary[]> {
    if (!doctorId) {
      throw new Error("Doctor ID is required");
    }
    return this.chatRepository.getDoctorChatList(doctorId);
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    if (!messageId) {
      throw new Error("Message ID is required");
    }
    return this.chatRepository.deleteMessage(messageId);
  }
}