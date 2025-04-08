import { INotification } from "../../models/notification";

export interface INotificationService {
    createNotification(data: {
      recipientId: string;
      recipientRole: string;
      message: string;
    }): Promise<INotification|null>;
  }