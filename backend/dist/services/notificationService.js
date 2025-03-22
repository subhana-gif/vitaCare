"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notificationRepository_1 = require("../repositories/notificationRepository");
class NotificationService {
    constructor() {
        this.notificationRepository = new notificationRepository_1.NotificationRepository();
    }
    async createNotification(data) {
        return await this.notificationRepository.createNotification(data);
    }
    async deleteNotification(filter) {
        await this.notificationRepository.deleteNotification(filter); // Assuming `NotificationModel` is your Mongoose model
    }
    async getAdminNotifications() {
        return await this.notificationRepository.findAllNotifications();
    }
    async markAllAsRead() {
        await this.notificationRepository.markAllAsRead();
    }
    async markAsRead(id) {
        return await this.notificationRepository.markAsRead(id);
    }
}
exports.NotificationService = NotificationService;
