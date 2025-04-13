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
exports.ChatdpController = void 0;
const HttpStatus_1 = require("../enums/HttpStatus");
const notificationService_1 = __importDefault(require("../services/notificationService"));
const doctorRepository_1 = require("../repositories/doctorRepository");
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
class ChatdpController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sender, receiver, text } = req.body;
                const imageUrl = req.body.imageUrl;
                if (!sender || !receiver) {
                    throw new Error("Sender and receiver IDs are required");
                }
                // Identify recipient role
                let recipientRole;
                const userRepo = userRepository_1.default.getInstance();
                const user = yield userRepo.findById(receiver);
                if (user) {
                    recipientRole = "user";
                }
                else {
                    const doctorRepo = new doctorRepository_1.DoctorRepository();
                    const doctor = yield doctorRepo.findById(receiver);
                    if (doctor) {
                        recipientRole = "doctor";
                    }
                    else {
                        throw new Error("Receiver not found in user or doctor records");
                    }
                }
                // Determine sender name (for notification message)
                let senderName = "Someone";
                const senderUser = yield userRepo.findById(sender);
                if (senderUser) {
                    senderName = senderUser.name;
                }
                else {
                    const doctorRepo = new doctorRepository_1.DoctorRepository();
                    const senderDoctor = yield doctorRepo.findById(sender);
                    if (senderDoctor) {
                        senderName = senderDoctor.name;
                    }
                }
                // Create notification with sender's name
                const notification = yield notificationService_1.default.createNotification({
                    recipientId: receiver,
                    recipientRole: recipientRole,
                    message: `New message from ${senderName}`,
                });
                (_a = req.io) === null || _a === void 0 ? void 0 : _a.to(receiver).emit("newNotification", notification);
                const message = yield this.chatService.sendMessage(sender, receiver, text, imageUrl);
                res.status(HttpStatus_1.HttpStatus.CREATED).json(message);
            }
            catch (error) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
            }
        });
    }
    getChatHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, doctorId } = req.params;
                const messages = yield this.chatService.getChatHistory(userId, doctorId);
                res.status(HttpStatus_1.HttpStatus.OK).json(messages);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                else {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
            }
        });
    }
    getDoctorChatList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { doctorId } = req.params;
                const chatList = yield this.chatService.getDoctorChatList(doctorId);
                res.status(HttpStatus_1.HttpStatus.OK).json(chatList);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                else {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
            }
        });
    }
    deleteMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId } = req.params;
                const result = yield this.chatService.deleteMessage(messageId);
                if (result) {
                    res.status(HttpStatus_1.HttpStatus.OK).json({ message: HttpStatus_1.HttpMessage.OK });
                }
                else {
                    res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ error: HttpStatus_1.HttpMessage.NOT_FOUND });
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                else {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
            }
        });
    }
}
exports.ChatdpController = ChatdpController;
