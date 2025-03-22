"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
class NotificationController {
    constructor() {
        this.getNotifications = async (req, res) => {
            try {
                const notifications = await this.notificationService.getAdminNotifications();
                res.json(notifications);
            }
            catch (error) {
                console.error("Error fetching notifications:", error);
                res.status(500).json({ message: "Error fetching notifications" });
            }
        };
        this.createNotification = async (req, res) => {
            try {
                const { message, type, doctorId } = req.body;
                const notification = await this.notificationService.createNotification({
                    message,
                    type,
                    doctorId
                });
                res.status(201).json(notification);
            }
            catch (error) {
                console.error("Error creating notification:", error);
                res.status(500).json({ message: "Failed to create notification" });
            }
        };
        this.markAllAsRead = async (req, res) => {
            try {
                await this.notificationService.markAllAsRead();
                res.status(200).json({ message: "All notifications marked as read" });
            }
            catch (error) {
                console.error("Error marking all notifications as read:", error);
                res.status(500).json({ message: "Failed to mark all notifications as read" });
            }
        };
        this.markAsRead = async (req, res) => {
            try {
                const { id } = req.params;
                const updatedNotification = await this.notificationService.markAsRead(id);
                if (!updatedNotification) {
                    res.status(404).json({ message: "Notification not found" });
                    return;
                }
                res.json(updatedNotification);
            }
            catch (error) {
                console.error("Error marking notification as read:", error);
                res.status(500).json({ message: "Error marking notification as read" });
            }
        };
        this.notificationService = new notificationService_1.NotificationService();
    }
}
exports.NotificationController = NotificationController;
exports.default = new NotificationController();
