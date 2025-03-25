import express from "express";
import { uploadAndSaveToS3 } from "../middleware/uploadMiddleware";
import { chatController } from "../controllers/chatController";
import chatdpController from "../controllers/chatdpController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", verifyToken(["user"]),chatController);
router.post("/send", verifyToken(["user","doctor"]),uploadAndSaveToS3, chatdpController.sendMessage);
router.get("/:userId/:doctorId", verifyToken(["user","doctor"]),chatdpController.getChatHistory);
router.get("/doctor/:doctorId/chats",verifyToken(["doctor"]), chatdpController.getDoctorChatList);

export default router;



