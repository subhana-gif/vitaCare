"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const tokenService_1 = __importDefault(require("../services/tokenService"));
const user_1 = __importDefault(require("../models/user"));
const HttpStatus_1 = require("../enums/HttpStatus");
const verifyToken = (roles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        // ✅ Ensure token is in "Bearer <token>" format
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: "Access Denied. No token provided." });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: "Access Denied. Invalid token format." });
            return;
        }
        try {
            const decoded = tokenService_1.default.verifyToken(token);
            if (!decoded.role || !roles.includes(decoded.role)) {
                res.status(HttpStatus_1.HttpStatus.FORBIDDEN).json({ message: "Forbidden: Insufficient permissions." });
                return;
            }
            const user = (user_1.default.findById(decoded.id));
            ;
            if (!user) {
                res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: "User not found." });
                return;
            }
            if (user.isBlocked) {
                res.status(HttpStatus_1.HttpStatus.FORBIDDEN).json({ message: "Your account is blocked. Please contact support." });
                return;
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error("Token verification error:", error);
            res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: HttpStatus_1.HttpMessage.UNAUTHORIZED });
        }
    };
};
exports.verifyToken = verifyToken;
