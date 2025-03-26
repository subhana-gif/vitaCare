// src/models/message.ts
import mongoose, { Document, Schema } from "mongoose";
import { IMessage } from "../interfaces/chat/IChatdpRepository";

interface IMessageDocument extends IMessage, Document {}

const messageSchema = new Schema<IMessageDocument>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String},
  media: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMessageDocument>("Message", messageSchema);