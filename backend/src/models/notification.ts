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

// Pre-save middleware to limit notifications to 5 per recipientId
NotificationSchema.pre("save", async function (this: INotification, next) {
  try {
    const notificationModel = this.constructor as mongoose.Model<INotification>;

    // Count existing notifications for this recipientId
    const notificationCount = await notificationModel.countDocuments({
      recipientId: this.recipientId,
    });

    // If there are 5 or more, delete the oldest one
    if (notificationCount >= 5) {
      const oldestNotification = await notificationModel
        .findOne({ recipientId: this.recipientId })
        .sort({ createdAt: 1 }); // Oldest first

      if (oldestNotification) {
        await notificationModel.deleteOne({ _id: oldestNotification._id });
        console.log(`Deleted oldest notification: ${oldestNotification._id}`);
      }
    }

    next(); // Proceed with saving the new notification
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error instanceof Error ? error : new Error("Failed in pre-save hook"));
  }
});

const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;