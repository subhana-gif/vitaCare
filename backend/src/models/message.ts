import { IMessageDocument } from "interfaces/chat/IChatdpRepository";
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage {
  sender: Types.ObjectId | string;
  receiver: Types.ObjectId | string;
  text?: string;
  media?: string;
  type?: "image" | "video" | "call" | "text";
  status?: "Missed" | "Not Answered" | "Completed";
  callDuration?: number;
  createdAt?: Date;
}

const messageSchema = new Schema<IMessageDocument>(
  {
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "Sender is required"] 
    },
    receiver: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "Receiver is required"] 
    },
    text: { 
      type: String, 
      trim: true, 
      maxlength: [1000, "Message cannot exceed 1000 characters"] 
    },
    media: { 
      type: String, 
      validate: {
        validator: function (value: string) {
          return !value || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp|mp4|mov|avi|mkv))$/.test(value);
        },
        message: "Invalid media URL format",
      },
    },
    type: {
      type: String,
      enum: ["image", "video", "call" , "text"],
      default: "text",
    },
    status: {
      type: String,
      enum: ["Missed", "Not Answered", "Completed"],
      required: function () {
        return this.type === "call";
      },
    },
    callDuration: {
      type: Number, // in minutes
      required: function () {
        return this.type === "call" && this.status === "Completed";
      },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure at least `text`, `media`, or `type: "call"` is provided
messageSchema.pre<IMessageDocument>("save", function (next) {
  if (!this.text && !this.media && this.type !== "call") {
    return next(new Error("Message must contain either text, media, or be a call"));
  }
  next();
});

export default mongoose.model<IMessageDocument>("Message", messageSchema);