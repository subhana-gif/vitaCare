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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatdpService = void 0;
class ChatdpService {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }
    sendMessage(sender, receiver, text, media, callData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!sender || !receiver) {
                throw new Error("Sender and receiver are required");
            }
            const message = Object.assign(Object.assign(Object.assign({ sender,
                receiver }, (text && { text })), (media && { media })), (callData && {
                type: callData.type,
                status: callData.status,
                callDuration: callData.callDuration,
                createdAt: callData.createdAt || new Date(),
            }));
            return this.chatRepository.saveMessage(message);
        });
    }
    // ... other methods remain unchanged
    getChatHistory(userId, doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !doctorId) {
                throw new Error("Both user ID and doctor ID are required");
            }
            return this.chatRepository.getMessages(userId, doctorId);
        });
    }
    getDoctorChatList(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!doctorId) {
                throw new Error("Doctor ID is required");
            }
            return this.chatRepository.getDoctorChatList(doctorId);
        });
    }
    deleteMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!messageId) {
                throw new Error("Message ID is required");
            }
            return this.chatRepository.deleteMessage(messageId);
        });
    }
}
exports.ChatdpService = ChatdpService;
