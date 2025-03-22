"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = __importDefault(require("../services/userService"));
class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async register(req, res, next) {
        try {
            const { email, password, name } = req.body;
            const result = await userService_1.default.register({ email, password, name });
            res.status(200).json({ success: true, message: "User registered successfully", data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await userService_1.default.login(email, password);
            res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: "An unexpected error occurred" });
            }
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await userService_1.default.forgotPassword(email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            const result = await userService_1.default.resetPassword(token, password);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async sendOTP(req, res, next) {
        try {
            const { email } = req.body;
            const result = await userService_1.default.sendOTP(email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOTP(req, res, next) {
        try {
            const { email, otp } = req.body;
            const result = await userService_1.default.verifyOTP(email, otp);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async resendOTP(req, res, next) {
        try {
            const { email } = req.body;
            const result = await userService_1.default.resendOTP(email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const users = await userService_1.default.getAllUsers();
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleBlockUser(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await userService_1.default.toggleBlockUser(userId);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error("User ID is missing");
            }
            const user = await userService_1.default.getUserProfile(userId);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
    async updateUserProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error("User ID is missing");
            }
            const updatedData = req.body;
            const user = await userService_1.default.updateUserProfile(userId, updatedData);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new UserController(userService_1.default);
