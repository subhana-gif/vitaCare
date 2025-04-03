"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatdpService = void 0;
class ChatdpService {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }
    async sendMessage(sender, receiver, text, media) {
        if (!sender || !receiver) {
            throw new Error("Sender, receiver are required");
        }
        const message = {
            sender,
            receiver,
            ...(text && { text }),
            ...(media && { media })
        };
        return this.chatRepository.saveMessage(message);
    }
    async getChatHistory(userId, doctorId) {
        if (!userId || !doctorId) {
            throw new Error("Both user ID and doctor ID are required");
        }
        return this.chatRepository.getMessages(userId, doctorId);
    }
    async getDoctorChatList(doctorId) {
        if (!doctorId) {
            throw new Error("Doctor ID is required");
        }
        return this.chatRepository.getDoctorChatList(doctorId);
    }
    async deleteMessage(messageId) {
        if (!messageId) {
            throw new Error("Message ID is required");
        }
        return this.chatRepository.deleteMessage(messageId);
    }
}
exports.ChatdpService = ChatdpService;
