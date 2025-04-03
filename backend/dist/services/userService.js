"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServiceInstance = exports.UserService = void 0;
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokenService_1 = __importDefault(require("../services/tokenService"));
const emailService_1 = __importDefault(require("../services/emailService"));
const logger_1 = __importDefault(require("../utils/logger"));
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(userData) {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("Email already registered");
        }
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
        const newUser = await this.userRepository.createUser({
            ...userData,
            password: hashedPassword,
        });
        const token = tokenService_1.default.generateToken({ id: newUser._id });
        return { token, user: newUser };
    }
    async login(email, password) {
        logger_1.default.info(`Login Attempt: ${email}`);
        const user = await this.userRepository.findByEmail(email);
        if (user?.isBlocked) {
            throw new Error("Blocked");
        }
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            throw new Error("Invalid credentials");
        }
        if (user.isBlocked) {
            throw new Error("Your account has been blocked. Please contact support.");
        }
        const token = tokenService_1.default.generateToken({ id: user._id, role: user.role || "user", name: user.name });
        return { token, user };
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("If this email exists in our system, you will receive reset instructions");
        }
        const resetToken = tokenService_1.default.generateToken({ email: user.email, role: "user" }, "1h");
        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
        await emailService_1.default.sendPasswordResetEmail(email, resetLink);
        return { success: true, message: "Reset instructions sent to your email" };
    }
    async resetPassword(token, newPassword) {
        const decoded = tokenService_1.default.verifyToken(token);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        console.log("hashed:", hashedPassword);
        await this.userRepository.updatePassword(decoded.email, hashedPassword);
        return { success: true, message: "Password reset successful" };
    }
    async sendOTP(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await emailService_1.default.sendOTPEmail(email, otp);
        return { success: true, message: "OTP sent successfully" };
    }
    async verifyOTP(email, otp) {
        return { success: true, message: "OTP verified successfully" };
    }
    async resendOTP(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await emailService_1.default.sendOTPEmail(email, otp);
        return { success: true, message: "OTP resent successfully" };
    }
    async getAllUsers() {
        return await this.userRepository.findAllUsers();
    }
    async toggleBlockUser(userId) {
        const user = await this.userRepository.toggleBlockStatus(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    async getUserProfile(userId) {
        return await this.userRepository.findById(userId);
    }
    async updateUserProfile(userId, data) {
        return await this.userRepository.updateUser(userId, data);
    }
    async getUserById(id) {
        return this.userRepository.findById(id);
    }
}
exports.UserService = UserService;
exports.userServiceInstance = new UserService(userRepository_1.default.getInstance());
