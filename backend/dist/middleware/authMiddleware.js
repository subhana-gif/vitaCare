"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const tokenService_1 = __importDefault(require("../services/tokenService"));
const user_1 = __importDefault(require("../models/user"));
const verifyToken = (roles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        // ✅ Ensure token is in "Bearer <token>" format
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Access Denied. No token provided." });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Access Denied. Invalid token format." });
            return;
        }
        try {
            const decoded = tokenService_1.default.verifyToken(token);
            if (!decoded.role || !roles.includes(decoded.role)) {
                res.status(403).json({ message: "Forbidden: Insufficient permissions." });
                return;
            }
            const user = (user_1.default.findById(decoded.id));
            ;
            if (!user) {
                res.status(404).json({ message: "User not found." });
                return;
            }
            if (user.isBlocked) {
                res.status(403).json({ message: "Your account is blocked. Please contact support." });
                return;
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error("Token verification error:", error);
            res.status(401).json({ message: "Invalid or expired token." });
        }
    };
};
exports.verifyToken = verifyToken;
