"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
class ChatController {
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async handleChatRequest(req, res) {
        try {
            const { message } = req.body;
            if (!message) {
                res.status(400).json({ error: "Message is required" });
                return;
            }
            const response = await this.geminiService.generateResponse(message);
            res.json({ response });
        }
        catch (error) {
            console.error("ChatController Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.ChatController = ChatController;
