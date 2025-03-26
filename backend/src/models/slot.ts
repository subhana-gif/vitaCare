import mongoose, { Schema, Document } from "mongoose";

export interface ISlot extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: string;
  startTime: string;  
  endTime: string;    
  price: number;
  status: "available" | "booked";
  isAvailable: boolean;
}

const slotSchema: Schema = new Schema(
  {
    doctorId: { type: mongoose.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },  
    endTime: { type: String, required: true },    
    price: { type: Number, required: true },
    status: { type: String, enum: ["available", "booked"], default: "available" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISlot>("Slot", slotSchema);
