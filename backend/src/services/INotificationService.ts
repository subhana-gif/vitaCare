// src/services/INotificationService.ts
export interface INotificationService {
    createNotification(data: {
      recipientId: string;
      recipientRole: string;
      message: string;
    }): Promise<any>;
    
    // Add other notification methods if needed
    // getNotifications?(userId: string): Promise<any[]>;
    // markAsRead?(notificationId: string): Promise<void>;
  }