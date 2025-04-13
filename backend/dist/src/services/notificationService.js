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
const notification_1 = __importDefault(require("../models/notification"));
const createNotification = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = new notification_1.default({
            recipientId: data.recipientId,
            recipientRole: data.recipientRole,
            message: data.message,
        });
        yield notification.save();
        return notification;
    }
    catch (error) {
        console.error("Error creating notification:", error);
        throw new Error("Failed to create notification.");
    }
});
exports.default = { createNotification };
