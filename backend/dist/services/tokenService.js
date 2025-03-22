"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TokenService {
    constructor() { }
    // Singleton Implementation
    static getInstance() {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }
    // Token Generation with Improved Typing
    generateToken(payload, expiresIn = "1h") {
        const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
        const options = {
            expiresIn: expiresIn,
        };
        return jsonwebtoken_1.default.sign(payload, jwtSecret, options);
    }
    // Updated Token Verification with Correct Payload Type
    verifyToken(token) {
        const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (!decoded.id) {
            throw new Error("Invalid token payload: Missing 'id'");
        }
        return decoded;
    }
}
exports.default = TokenService.getInstance();
