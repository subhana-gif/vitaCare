"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const notification_1 = __importDefault(require("../models/notification"));
class NotificationRepository {
    async createNotification(data) {
        const notification = new notification_1.default(data);
        return await notification.save();
    }
    async findAllNotifications() {
        return await notification_1.default.find();
    }
    async deleteNotification(filter) {
        await notification_1.default.deleteOne(filter);
    }
    async markAllAsRead() {
        await notification_1.default.updateMany({ read: false }, { read: true });
    }
    async markAsRead(id) {
        return await notification_1.default.findByIdAndUpdate(id, { read: true }, { new: true });
    }
}
exports.NotificationRepository = NotificationRepository;
