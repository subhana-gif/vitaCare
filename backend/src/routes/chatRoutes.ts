import express from "express";
import { uploadAndSaveToS3 } from "../middleware/uploadMiddleware";
import { ChatController } from "../controllers/chatController";
import { GeminiService } from "../services/geminiService";
import { GeminiRepository } from "../repositories/geminiRepository";
import { verifyToken } from "../middleware/authMiddleware";
import {ChatdpRepository} from "../repositories/chatdpRepository";
import  {ChatdpService} from "../services/chatdpservices";
import {ChatdpController} from "../controllers/chatdpController";

const router = express.Router();

const geminiRepository = new GeminiRepository();
const geminiService = new GeminiService(geminiRepository);
const chatController = new ChatController(geminiService);

const chatdpRepository = new ChatdpRepository();
const chatdpService = new ChatdpService(chatdpRepository);
const chatdpController = new ChatdpController(chatdpService);


router.post("/", verifyToken(["user"]), chatController.handleChatRequest.bind(chatController));

router.post("/send",verifyToken(["user", "doctor"]),uploadAndSaveToS3,chatdpController.sendMessage.bind(chatdpController));
router.get("/:userId/:doctorId",verifyToken(["user", "doctor"]),chatdpController.getChatHistory.bind(chatdpController));
router.get("/doctor/:doctorId/chats",verifyToken(["doctor"]),chatdpController.getDoctorChatList.bind(chatdpController));
router.delete("/message/:messageId", verifyToken(["user", "doctor"]), chatdpController.deleteMessage.bind(chatdpController));
  
export default router;



