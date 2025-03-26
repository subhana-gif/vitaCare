import mongoose, { Schema, Document } from "mongoose";

export interface ISlot extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: string;
  startTime: string;  // Changed from time to startTime
  endTime: string;    // Added endTime field
  price: number;
  status: "available" | "booked";
  isAvailable: boolean;
}

const slotSchema: Schema = new Schema(
  {
    doctorId: { type: mongoose.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },  // Changed from time
    endTime: { type: String, required: true },    // Added endTime
    price: { type: Number, required: true },
    status: { type: String, enum: ["available", "booked"], default: "available" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISlot>("Slot", slotSchema);
