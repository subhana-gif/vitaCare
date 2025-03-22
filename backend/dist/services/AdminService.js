"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tokenService_1 = __importDefault(require("./tokenService"));
class AuthService {
    constructor(tokenService) {
        this.tokenService = tokenService;
    }
    async login(email, password) {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
        if (email.trim() !== ADMIN_EMAIL.trim() || password.trim() !== ADMIN_PASSWORD.trim()) {
            throw new Error("Invalid credentials");
        }
        return this.tokenService.generateToken({ email: ADMIN_EMAIL, role: "admin" });
    }
}
exports.default = new AuthService(tokenService_1.default);
