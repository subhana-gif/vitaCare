"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Public Routes
router.post("/login", userController_1.default.login);
router.post("/signup", userController_1.default.register);
router.post("/forgot-password", userController_1.default.forgotPassword);
router.post("/reset-password", userController_1.default.resetPassword);
router.post("/send-otp", userController_1.default.sendOTP);
router.post("/verify-otp", userController_1.default.verifyOTP);
router.post("/resend-otp", userController_1.default.resendOTP);
router.get("/", userController_1.default.getAllUsers);
router.put("/block/:userId", userController_1.default.toggleBlockUser);
router.get("/profile", authMiddleware_1.authenticateToken, userController_1.default.getUserProfile);
router.put("/profile", authMiddleware_1.authenticateToken, userController_1.default.updateUserProfile);
exports.default = router;
