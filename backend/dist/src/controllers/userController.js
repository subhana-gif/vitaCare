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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const userService_1 = require("../services/userService");
const HttpStatus_1 = require("../enums/HttpStatus");
class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, name } = req.body;
                const result = yield this.userService.register({ email, password, name });
                res.status(HttpStatus_1.HttpStatus.OK).json({ success: true, message: "User registered successfully", data: result });
            }
            catch (error) {
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const result = yield this.userService.login(email, password);
                res.status(HttpStatus_1.HttpStatus.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield this.userService.forgotPassword(email);
                res.status(HttpStatus_1.HttpStatus.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, password } = req.body;
                const result = yield this.userService.resetPassword(token, password);
                res.status(HttpStatus_1.HttpStatus.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    sendOTP(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield this.userService.sendOTP(email);
                res.status(HttpStatus_1.HttpStatus.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyOTP(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const result = yield this.userService.verifyOTP(email, otp);
                res.status(HttpStatus_1.HttpStatus.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    resendOTP(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield this.userService.resendOTP(email);
                res.status(HttpStatus_1.HttpStatus.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userService.getAllUsers();
                res.status(HttpStatus_1.HttpStatus.OK).json(users);
            }
            catch (error) {
                next(error);
            }
        });
    }
    toggleBlockUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const user = yield this.userService.toggleBlockUser(userId);
                res.status(HttpStatus_1.HttpStatus.OK).json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new Error("User ID is missing");
                }
                const user = yield this.userService.getUserProfile(userId);
                res.status(HttpStatus_1.HttpStatus.OK).json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateUserProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new Error("User ID is missing");
                }
                const { name, phone, address, gender, dob } = req.body;
                const updatedData = {
                    name,
                    phone,
                    address,
                    gender,
                    dob
                };
                // Filter out undefined values
                const filteredData = Object.fromEntries(Object.entries(updatedData).filter(([_, v]) => v !== undefined));
                const user = yield this.userService.updateUserProfile(userId, filteredData);
                res.status(HttpStatus_1.HttpStatus.OK).json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new Error("User ID is missing");
                }
                const { currentPassword, newPassword } = req.body;
                const result = yield this.userService.changePassword(userId, currentPassword, newPassword);
                res.status(HttpStatus_1.HttpStatus.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.userController = new UserController(userService_1.userServiceInstance);
