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
exports.ChatController = void 0;
const HttpStatus_1 = require("../enums/HttpStatus");
class ChatController {
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    handleChatRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { message } = req.body;
                if (!message) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ error: "Message is required" });
                    return;
                }
                const response = yield this.geminiService.generateResponse(message);
                res.json({ response });
            }
            catch (error) {
                console.error("ChatController Error:", error);
                res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: HttpStatus_1.HttpMessage.INTERNAL_SERVER_ERROR });
            }
        });
    }
}
exports.ChatController = ChatController;
