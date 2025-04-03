"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatdpController = void 0;
class ChatdpController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async sendMessage(req, res) {
        try {
            const { sender, receiver, text } = req.body;
            const imageUrl = req.body.imageUrl;
            if (!sender || !receiver) {
                throw new Error("Sender and receiver IDs are required");
            }
            const message = await this.chatService.sendMessage(sender, receiver, text, imageUrl);
            res.status(201).json(message);
        }
        catch (error) {
            console.error("Controller error:", error);
            res.status(400).json({ error: error.message });
        }
    }
    async getChatHistory(req, res) {
        try {
            const { userId, doctorId } = req.params;
            const messages = await this.chatService.getChatHistory(userId, doctorId);
            res.status(200).json(messages);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getDoctorChatList(req, res) {
        try {
            const { doctorId } = req.params;
            const chatList = await this.chatService.getDoctorChatList(doctorId);
            res.status(200).json(chatList);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            const result = await this.chatService.deleteMessage(messageId);
            if (result) {
                res.status(200).json({ message: "Message deleted successfully" });
            }
            else {
                res.status(404).json({ error: "Message not found" });
            }
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.ChatdpController = ChatdpController;
