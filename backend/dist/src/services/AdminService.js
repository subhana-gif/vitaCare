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
const tokenService_1 = __importDefault(require("./tokenService"));
class AuthService {
    constructor(tokenService) {
        this.tokenService = tokenService;
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@gmail.com";
            const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
            if (email.trim() !== ADMIN_EMAIL.trim() || password.trim() !== ADMIN_PASSWORD.trim()) {
                throw new Error("Invalid credentials");
            }
            return this.tokenService.generateToken({ email: ADMIN_EMAIL, role: "admin", id: "admin123" });
        });
    }
}
exports.default = new AuthService(tokenService_1.default);
