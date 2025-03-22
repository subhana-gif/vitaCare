import express from "express";
import multer from "multer";
import { uploadAndSaveToS3 } from "../middleware/uploadMiddleware";
import { chatController } from "../controllers/chatController";
import chatdpController from "../controllers/chatdpController";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });

router.post("/", chatController);
router.post("/send", uploadAndSaveToS3, chatdpController.sendMessage);
router.get("/:userId/:doctorId", chatdpController.getChatHistory);
router.get("/doctor/:doctorId/chats", chatdpController.getDoctorChatList);

export default router;



