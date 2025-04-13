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
exports.userServiceInstance = exports.UserService = void 0;
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokenService_1 = __importDefault(require("../services/tokenService"));
const emailService_1 = __importDefault(require("../services/emailService"));
const logger_1 = __importDefault(require("../utils/logger"));
const otpStore_1 = require("../config/otpStore");
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new Error("Email already registered");
            }
            const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
            const newUser = yield this.userRepository.createUser(Object.assign(Object.assign({}, userData), { password: hashedPassword }));
            const token = tokenService_1.default.generateToken({ id: newUser._id });
            return { token, user: newUser };
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`Login Attempt: ${email}`);
            const user = yield this.userRepository.findByEmail(email);
            if (user === null || user === void 0 ? void 0 : user.isBlocked) {
                throw new Error("Blocked");
            }
            if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
                throw new Error("Invalid credentials");
            }
            if (user.isBlocked) {
                throw new Error("Your account has been blocked. Please contact support.");
            }
            const token = tokenService_1.default.generateToken({ id: user._id, role: user.role || "user", name: user.name });
            return { token, user };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error("If this email exists in our system, you will receive reset instructions");
            }
            const resetToken = tokenService_1.default.generateToken({ email: user.email, role: "user" }, "1h");
            const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
            yield emailService_1.default.sendPasswordResetEmail(email, resetLink);
            return { success: true, message: "Reset instructions sent to your email" };
        });
    }
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = tokenService_1.default.verifyToken(token);
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            yield this.userRepository.updatePassword(decoded.email, hashedPassword);
            return { success: true, message: "Password reset successful" };
        });
    }
    sendOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            (0, otpStore_1.saveOTP)(email, otp, 300); // Store for 5 minutes
            yield emailService_1.default.sendOTPEmail(email, otp);
            return { success: true, message: "OTP sent successfully" };
        });
    }
    verifyOTP(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = (0, otpStore_1.verifyOTP)(email, otp);
            if (!isValid)
                throw new Error("Invalid or expired OTP");
            return { success: true, message: "OTP verified successfully" };
        });
    }
    resendOTP(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            (0, otpStore_1.saveOTP)(email, otp, 300);
            yield emailService_1.default.sendOTPEmail(email, otp);
            return { success: true, message: "OTP resent successfully" };
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findAllUsers();
        });
    }
    toggleBlockUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.toggleBlockStatus(userId);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        });
    }
    getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findById(userId);
        });
    }
    updateUserProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.updateUser(userId, data);
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findById(id);
        });
    }
    changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user by ID
            const user = yield this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            // Verify current password
            const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new Error("Current password is incorrect");
            }
            // Hash new password
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            // Update password
            yield this.userRepository.updateUser(userId, {
                password: hashedPassword
            });
            return {
                success: true,
                message: "Password changed successfully"
            };
        });
    }
}
exports.UserService = UserService;
exports.userServiceInstance = new UserService(userRepository_1.default.getInstance());
