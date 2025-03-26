import mongoose, { Schema, Document } from "mongoose";

type Role = "user" | "doctor" | "admin";

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  recipientRole: Role;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientRole: { type: String, enum: ["user", "doctor", "admin"], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
