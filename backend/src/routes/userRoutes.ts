import express from "express";
import {userController} from "../controllers/userController";
import {verifyToken} from "../middleware/authMiddleware";
import {validate} from "../middleware/validationMiddleware"

const router = express.Router();

router.post('/login', validate(),userController.login.bind(userController));
router.post("/signup",validate(), userController.register.bind(userController));
router.post("/forgot-password", userController.forgotPassword.bind(userController));
router.post("/reset-password", userController.resetPassword.bind(userController));
router.post("/send-otp", userController.sendOTP.bind(userController));
router.post("/verify-otp", userController.verifyOTP.bind(userController));
router.post("/resend-otp", userController.resendOTP.bind(userController));

router.get("/", verifyToken(["admin"]),userController.getAllUsers.bind(userController));
router.put("/block/:userId",verifyToken(["admin"]), userController.toggleBlockUser.bind(userController));
router.get("/profile",verifyToken(["admin","user"]), userController.getUserProfile.bind(userController));
router.put("/profile", validate(),verifyToken(["admin","user"]),userController.updateUserProfile.bind(userController));

export default router;