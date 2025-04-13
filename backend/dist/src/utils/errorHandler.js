"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrorResponse = void 0;
const logger_1 = __importDefault(require("./logger"));
const handleErrorResponse = (res, error, defaultMessage) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    logger_1.default.error(errorMessage, error);
    res.status(500).json({ message: errorMessage });
};
exports.handleErrorResponse = handleErrorResponse;
