"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiRepository = void 0;
const generative_ai_1 = require("@google/generative-ai");
const gemini_1 = __importDefault(require("../config/gemini"));
class GeminiRepository {
    constructor() {
        const genAI = new generative_ai_1.GoogleGenerativeAI(gemini_1.default.gemini.apiKey);
        this.model = genAI.getGenerativeModel({ model: gemini_1.default.gemini.modelName });
    }
    async getResponse(message) {
        try {
            const result = await this.model.generateContent(message);
            const response = result.response.text();
            if (!response) {
                throw new Error("Empty response from AI model");
            }
            return response;
        }
        catch (error) {
            console.error("GeminiRepository Error:", error);
            throw new Error("Failed to get AI response");
        }
    }
}
exports.GeminiRepository = GeminiRepository;
