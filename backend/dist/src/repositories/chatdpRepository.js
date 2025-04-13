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
exports.ChatdpRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const message_1 = __importDefault(require("../models/message"));
class ChatdpRepository {
    saveMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new message_1.default(message);
            const savedMessage = yield newMessage.save();
            return savedMessage.toObject();
        });
    }
    getMessages(userId, doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield message_1.default.find({
                $or: [
                    { sender: userId, receiver: doctorId },
                    { sender: doctorId, receiver: userId }
                ]
            }).lean();
            return messages;
        });
    }
    getDoctorChatList(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield message_1.default.aggregate([
                    { $match: { receiver: new mongoose_1.default.Types.ObjectId(doctorId) } },
                    {
                        $group: {
                            _id: "$sender",
                            lastMessage: { $last: "$text" },
                            lastMessageTime: { $last: "$createdAt" } // Add this line
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",
                            as: "userDetails"
                        }
                    },
                    { $unwind: "$userDetails" },
                    { $project: {
                            _id: 1,
                            lastMessage: 1,
                            lastMessageTime: 1, // Include in projection
                            "userDetails.name": 1,
                            "userDetails.email": 1
                        }
                    }
                ]);
            }
            catch (error) {
                throw new Error(`Failed to get doctor chat list: ${error.message}`);
            }
        });
    }
    deleteMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield message_1.default.findByIdAndDelete(messageId);
                return result !== null;
            }
            catch (error) {
                throw new Error(`Failed to delete message: ${error.message}`);
            }
        });
    }
}
exports.ChatdpRepository = ChatdpRepository;
