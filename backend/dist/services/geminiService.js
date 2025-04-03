"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
class GeminiService {
    constructor(aiRepository) {
        this.aiRepository = aiRepository;
    }
    async generateResponse(message) {
        try {
            if (!message.trim()) {
                throw new Error("Message cannot be empty");
            }
            return await this.aiRepository.getResponse(message);
        }
        catch (error) {
            console.error("GeminiService Error:", error);
            return "I'm sorry, I couldn't process that request.";
        }
    }
}
exports.GeminiService = GeminiService;
