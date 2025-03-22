import ChatRepository from "../repositories/chatdpRepository";

class ChatService {
  async sendMessage(sender: string, receiver: string, text: string, media: string | null) {
    return await ChatRepository.saveMessage(sender, receiver, text, media);
  }

  async getChatHistory(userId: string, doctorId: string) {
    return await ChatRepository.getMessages(userId, doctorId);
  }
}

export default new ChatService();
