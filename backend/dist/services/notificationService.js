"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_1 = __importDefault(require("../models/notification"));
const createNotification = async (data) => {
    try {
        const notification = new notification_1.default({
            recipientId: data.recipientId,
            recipientRole: data.recipientRole,
            message: data.message,
        });
        await notification.save();
        return notification;
    }
    catch (error) {
        console.error("Error creating notification:", error);
        throw new Error("Failed to create notification.");
    }
};
exports.default = { createNotification };
