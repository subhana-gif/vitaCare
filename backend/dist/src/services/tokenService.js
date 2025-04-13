"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TokenService {
    constructor() { }
    static getInstance() {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }
    generateToken(payload, expiresIn = "2h") {
        const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
        const options = {
            expiresIn: expiresIn,
        };
        return jsonwebtoken_1.default.sign(payload, jwtSecret, options);
    }
    verifyToken(token) {
        const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (!decoded.role) {
            throw new Error("Invalid token payload: Missing required fields");
        }
        return decoded;
    }
}
exports.default = TokenService.getInstance();
