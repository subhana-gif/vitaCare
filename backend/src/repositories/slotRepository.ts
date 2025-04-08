import { Types } from "mongoose";
import Slot, { ISlot } from "../models/slot";

class SlotRepository {
 
  async getSlotById(slotId: string): Promise<ISlot | null> {
    return await Slot.findById(slotId);
  }

  async createSlot(slotData: Partial<ISlot>): Promise<ISlot> {
    return await Slot.create(slotData);
  }

  async getSlotsByDoctorAndDay(doctorId: string, dayOfWeek: string): Promise<ISlot[]> {
    return await Slot.find({
      doctorId: new Types.ObjectId(doctorId),
      dayOfWeek,
    })as ISlot[];
  }

  async getSlotsByDoctorId(doctorId: string): Promise<ISlot[]> {
    return await Slot.find({ doctorId });
  }



  async updateSlot(slotId: string, updatedData: Partial<ISlot>): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(slotId, updatedData, { new: true });
  }

  async markSlotUnavailable(slotId: string): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(slotId, { isAvailable: false }, { new: true });
  }

  async markSlotAvailable(slotId: string): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(slotId, { isAvailable: true }, { new: true });
  }

  async getSlotsByDoctorAndDate(doctorId: string, date: string): Promise<ISlot[]> {
    return await Slot.find({ doctorId, date, isAvailable: true });
  }

  async markSlotAsBooked(slotId: string): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(slotId, { status: "booked", isAvailable: false }, { new: true });
  }

  async getSlotByDetails(doctorId: string, date: string, time: string): Promise<ISlot | null> {
    return await Slot.findOne({ 
        doctorId, 
        date,
        startTime: { $lte: time },  
        endTime: { $gt: time },      
        isAvailable: true 
    });
}

}

export default new SlotRepository();