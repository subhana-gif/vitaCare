import { IChatRepository, IMessage,IMessageDocument  } from "../interfaces/chat/IChatdpRepository";

export class ChatdpService {
  constructor(private readonly chatRepository: IChatRepository) {}

  async sendMessage(sender: string, receiver: string, text?: string, media?: string): Promise<IMessageDocument> {
    if (!sender || !receiver ) {
      throw new Error("Sender, receiver are required");
    }

    const message: Partial<IMessage> = {
      sender,
      receiver,
      ...(text && { text }),
      ...(media && { media })
    };

    return this.chatRepository.saveMessage(message as IMessage);
  }

  async getChatHistory(userId: string, doctorId: string): Promise<IMessageDocument[]> {
    if (!userId || !doctorId) {
      throw new Error("Both user ID and doctor ID are required");
    }
    return this.chatRepository.getMessages(userId, doctorId);
  }

  async getDoctorChatList(doctorId: string): Promise<any[]> {
    if (!doctorId) {
      throw new Error("Doctor ID is required");
    }
    return this.chatRepository.getDoctorChatList(doctorId);
  }
}