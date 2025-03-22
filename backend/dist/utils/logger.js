"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: 'info', // Log levels: error, warn, info, http, verbose, debug, silly
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), // Add timestamps
    winston_1.default.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })),
    transports: [
        new winston_1.default.transports.Console(), // Show logs in console
        new winston_1.default.transports.File({ filename: 'logs/app.log' }) // Store logs in file
    ]
});
exports.default = logger;
