"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    getResponse(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.model.generateContent(message);
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
        });
    }
}
exports.GeminiRepository = GeminiRepository;
