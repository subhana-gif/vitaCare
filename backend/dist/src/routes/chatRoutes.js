"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const chatController_1 = require("../controllers/chatController");
const geminiService_1 = require("../services/geminiService");
const geminiRepository_1 = require("../repositories/geminiRepository");
const authMiddleware_1 = require("../middleware/authMiddleware");
const chatdpRepository_1 = require("../repositories/chatdpRepository");
const chatdpservices_1 = require("../services/chatdpservices");
const chatdpController_1 = require("../controllers/chatdpController");
const callController_1 = require("../controllers/callController");
const callhsitoryRepository_1 = require("../repositories/callhsitoryRepository");
const callService_1 = require("../services/callService");
const router = express_1.default.Router();
const geminiRepository = new geminiRepository_1.GeminiRepository();
const geminiService = new geminiService_1.GeminiService(geminiRepository);
const chatController = new chatController_1.ChatController(geminiService);
const chatdpRepository = new chatdpRepository_1.ChatdpRepository();
const chatdpService = new chatdpservices_1.ChatdpService(chatdpRepository);
const chatdpController = new chatdpController_1.ChatdpController(chatdpService);
const callHistoryRepository = new callhsitoryRepository_1.CallHistoryRepository();
const callService = new callService_1.CallService(callHistoryRepository);
const callController = new callController_1.CallController(callService);
router.post("/", (0, authMiddleware_1.verifyToken)(["user"]), chatController.handleChatRequest.bind(chatController));
router.post("/send", (0, authMiddleware_1.verifyToken)(["user", "doctor"]), uploadMiddleware_1.uploadAndSaveToS3, chatdpController.sendMessage.bind(chatdpController));
router.get("/:userId/:doctorId", (0, authMiddleware_1.verifyToken)(["user", "doctor"]), chatdpController.getChatHistory.bind(chatdpController));
router.get("/doctor/:doctorId/chats", (0, authMiddleware_1.verifyToken)(["doctor"]), chatdpController.getDoctorChatList.bind(chatdpController));
router.delete("/message/:messageId", (0, authMiddleware_1.verifyToken)(["user", "doctor"]), chatdpController.deleteMessage.bind(chatdpController));
router.get("/call/:userId/:targetId", (req, res) => callController.getCallHistory(req, res));
exports.default = router;
