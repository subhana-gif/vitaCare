import mongoose, { Schema, Document } from "mongoose";

// Define possible roles
type Role = "user" | "doctor" | "admin";

// Notification Interface
export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  recipientRole: Role;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Notification Schema
const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true }, // Store the user/doctor/admin ID
    recipientRole: { type: String, enum: ["user", "doctor", "admin"], required: true }, // Role type
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
