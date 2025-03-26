import mongoose, { Schema, Document, Model } from "mongoose";
import { ISlotDTO } from "../interfaces/ISlot";

export interface SlotDocument extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "available" | "booked";
  isAvailable: boolean;
  toDTO(): ISlotDTO;
}

interface SlotModel extends Model<SlotDocument> {}

const slotSchema: Schema<SlotDocument, SlotModel> = new Schema(
  {
    doctorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Doctor", 
      required: true 
    },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ["available", "booked"], default: "available" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Add a method to convert Mongoose document to DTO
slotSchema.methods.toDTO = function(): ISlotDTO {
  return {
    id: this._id.toString(),
    doctorId: this.doctorId.toString(),
    date: this.date,
    startTime: this.startTime,
    endTime: this.endTime,
    price: this.price,
    status: this.status,
    isAvailable: this.isAvailable
  };
};

const SlotModel = mongoose.model<SlotDocument, SlotModel>("Slot", slotSchema);

export default SlotModel;