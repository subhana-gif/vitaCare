"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const userService_1 = require("../services/userService");
class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async register(req, res, next) {
        try {
            const { email, password, name } = req.body;
            const result = await this.userService.register({ email, password, name });
            res.status(200).json({ success: true, message: "User registered successfully", data: result });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await this.userService.login(email, password);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await this.userService.forgotPassword(email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            const result = await this.userService.resetPassword(token, password);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async sendOTP(req, res, next) {
        try {
            const { email } = req.body;
            const result = await this.userService.sendOTP(email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOTP(req, res, next) {
        try {
            const { email, otp } = req.body;
            const result = await this.userService.verifyOTP(email, otp);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async resendOTP(req, res, next) {
        try {
            const { email } = req.body;
            const result = await this.userService.resendOTP(email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleBlockUser(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await this.userService.toggleBlockUser(userId);
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
            const user = await this.userService.getUserProfile(userId);
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
            const user = await this.userService.updateUserProfile(userId, updatedData);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.userController = new UserController(userService_1.userServiceInstance);
