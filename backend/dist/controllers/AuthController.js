"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = __importDefault(require("../services/AuthService"));
class AuthController {
    constructor() {
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ message: "Email and password are required" });
                }
                const token = await AuthService_1.default.login(email, password);
                return res.json({ token });
            }
            catch (error) {
                console.error("Login failed:", error);
                return res.status(401).json({ message: "Invalid Credentials" });
            }
        };
    }
}
exports.default = new AuthController();
