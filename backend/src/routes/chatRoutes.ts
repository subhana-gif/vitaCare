import express from "express";
import { uploadAndSaveToS3 } from "../middleware/uploadMiddleware";
import { ChatController } from "../controllers/chatController";
import { GeminiService } from "../services/geminiService";
import { GeminiRepository } from "../repositories/geminiRepository";
import { verifyToken } from "../middleware/authMiddleware";
import {ChatdpRepository} from "../repositories/chatdpRepository";
import  {ChatdpService} from "../services/chatdpservices";
import {ChatdpController} from "../controllers/chatdpController";
import { CallController } from "../controllers/callController";
import { CallHistoryRepository } from "../repositories/callhsitoryRepository";
import { CallService } from "../services/callService";

const router = express.Router();

const geminiRepository = new GeminiRepository();
const geminiService = new GeminiService(geminiRepository);
const chatController = new ChatController(geminiService);

const chatdpRepository = new ChatdpRepository();
const chatdpService = new ChatdpService(chatdpRepository);
const chatdpController = new ChatdpController(chatdpService);

const callHistoryRepository = new CallHistoryRepository();
const callService = new CallService(callHistoryRepository);
const callController = new CallController(callService);

router.post("/", verifyToken(["user"]), chatController.handleChatRequest.bind(chatController));

router.post("/send",verifyToken(["user", "doctor"]),uploadAndSaveToS3,chatdpController.sendMessage.bind(chatdpController));
router.get("/:userId/:doctorId",verifyToken(["user", "doctor"]),chatdpController.getChatHistory.bind(chatdpController));
router.get("/doctor/:doctorId/chats",verifyToken(["doctor"]),chatdpController.getDoctorChatList.bind(chatdpController));
router.delete("/message/:messageId", verifyToken(["user", "doctor"]), chatdpController.deleteMessage.bind(chatdpController));
router.get("/call/:userId/:targetId", (req, res) => callController.getCallHistory(req, res));
export default router;



