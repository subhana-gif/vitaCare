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
    recipientId: { 
      type: Schema.Types.ObjectId, 
      required: [true, "Recipient ID is required"], 
      refPath: "recipientRole" // Dynamically reference based on role
    },
    recipientRole: { 
      type: String, 
      enum: ["user", "doctor", "admin"], 
      required: [true, "Recipient role is required"]
    },
    message: { 
      type: String, 
      required: [true, "Message cannot be empty"], 
      minlength: [3, "Message must be at least 3 characters long"], 
      maxlength: [500, "Message cannot exceed 500 characters"]
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure recipientId matches the recipientRole model
NotificationSchema.pre<INotification>("save", async function (next) {
  const roleModelMap: Record<Role, string> = {
    user: "User",
    doctor: "Doctor",
    admin: "Admin"
  };

  const modelName = roleModelMap[this.recipientRole];
  const exists = await mongoose.model(modelName).exists({ _id: this.recipientId });

  if (!exists) {
    return next(new Error(`${this.recipientRole} with ID ${this.recipientId} does not exist`));
  }
  next();
});

const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
