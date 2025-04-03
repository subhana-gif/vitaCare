"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatdpRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const message_1 = __importDefault(require("../models/message"));
class ChatdpRepository {
    async saveMessage(message) {
        const newMessage = new message_1.default(message);
        const savedMessage = await newMessage.save();
        return savedMessage.toObject();
    }
    async getMessages(userId, doctorId) {
        const messages = await message_1.default.find({
            $or: [
                { sender: userId, receiver: doctorId },
                { sender: doctorId, receiver: userId }
            ]
        }).lean();
        return messages;
    }
    async getDoctorChatList(doctorId) {
        try {
            return await message_1.default.aggregate([
                { $match: { receiver: new mongoose_1.default.Types.ObjectId(doctorId) } },
                { $group: { _id: "$sender", lastMessage: { $last: "$text" } } },
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
                        "userDetails.name": 1,
                        "userDetails.email": 1
                    }
                }
            ]);
        }
        catch (error) {
            throw new Error(`Failed to get doctor chat list: ${error.message}`);
        }
    }
    async deleteMessage(messageId) {
        try {
            const result = await message_1.default.findByIdAndDelete(messageId);
            return result !== null;
        }
        catch (error) {
            throw new Error(`Failed to delete message: ${error.message}`);
        }
    }
}
exports.ChatdpRepository = ChatdpRepository;
