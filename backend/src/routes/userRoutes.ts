import express from "express";
import UserController from "../controllers/userController";
import {verifyToken} from "../middleware/authMiddleware";

const router = express.Router();

router.post("/login", UserController.login);
router.post("/signup", UserController.register);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);
router.post("/send-otp", UserController.sendOTP);
router.post("/verify-otp", UserController.verifyOTP);
router.post("/resend-otp", UserController.resendOTP);

router.get("/", verifyToken(["admin"]),UserController.getAllUsers);
router.put("/block/:userId",verifyToken(["admin"]), UserController.toggleBlockUser);
router.get("/profile",verifyToken(["admin","user"]), UserController.getUserProfile);
router.put("/profile", verifyToken(["admin","user"]),UserController.updateUserProfile);

export default router;