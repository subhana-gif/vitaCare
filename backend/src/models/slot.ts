// Update src/models/slot.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISlot extends Document {
  _id: Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "available" | "booked";
  isAvailable: boolean;
  startDate?: Date;  // New field
  endDate?: Date;    // New field
}

const slotSchema: Schema = new Schema(
  {
    doctorId: { type: mongoose.Types.ObjectId, ref: "Doctor", required: true },
    dayOfWeek: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ["available", "booked"], default: "available" },
    isAvailable: { type: Boolean, default: true },
    startDate: { type: Date },  // New field
    endDate: { type: Date }     // New field
  },
  { timestamps: true }
);

export default mongoose.model<ISlot>("Slot", slotSchema);