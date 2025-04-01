import mongoose, { Document, Schema } from "mongoose";
import { IMessage } from "../interfaces/chat/IChatdpRepository";

interface IMessageDocument extends IMessage, Document {}

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
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure at least `text` or `media` is provided
messageSchema.pre<IMessageDocument>("save", function (next) {
  if (!this.text && !this.media) {
    return next(new Error("Message must contain either text or media"));
  }
  next();
});

export default mongoose.model<IMessageDocument>("Message", messageSchema);
