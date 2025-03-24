import Notification from "../models/notification";

interface NotificationData {
  recipientId: string;
  recipientRole: "user" | "doctor" | "admin";
  message: string;
}

const createNotification = async (data: NotificationData) => {
  try {
    const notification = new Notification({
      recipientId: data.recipientId,
      recipientRole: data.recipientRole,
      message: data.message,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification.");
  }
};

export default { createNotification };
