export interface INotificationService {
    createNotification(data: {
      recipientId: string;
      recipientRole: string;
      message: string;
    }): Promise<any>;
  }