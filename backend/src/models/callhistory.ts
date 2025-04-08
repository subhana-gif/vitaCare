import mongoose, { Document, Schema } from "mongoose";
import { ICallHistory } from "../interfaces/chat/IChatdpRepository";

interface ICallHistoryDocument extends ICallHistory, Document {}

const callHistorySchema = new Schema<ICallHistoryDocument>(
  {
    callerId: { type: Schema.Types.ObjectId, required: true },
    receiverId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ["video", "audio"], default: "video" },
    status: {
      type: String,
      enum: ["completed", "missed", "rejected", "no_answer"],
      required: true,
    },
    duration: { type: Number }, // in seconds
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ICallHistoryDocument>("CallHistory", callHistorySchema);