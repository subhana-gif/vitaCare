// Update src/repositories/slotRepository.ts
import { ISlot } from "../models/slot";
import Slot from "../models/slot";
import { Types } from "mongoose";

export default {
  async createSlot(slotData: Partial<ISlot>): Promise<ISlot> {
    const slot = new Slot(slotData);
    return await slot.save();
  },

  async getSlotsByDoctorId(doctorId: string): Promise<ISlot[]> {
    return await Slot.find({ doctorId }).exec();
  },

  async getSlotById(slotId: string): Promise<ISlot | null> {
    return await Slot.findById(slotId).exec();
  },

  async updateSlot(slotId: string, updatedData: Partial<ISlot>): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(slotId, updatedData, { new: true }).exec();
  },

  async markSlotUnavailable(slotId: string): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(
      slotId,
      { isAvailable: false },
      { new: true }
    ).exec();
  },

  async markSlotAvailable(slotId: string): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(
      slotId,
      { isAvailable: true },
      { new: true }
    ).exec();
  },

  async getSlotsByDoctorAndDay(doctorId: string, dayOfWeek: string, selectedDate: Date): Promise<ISlot[]> {
    return await Slot.find({ doctorId,
      dayOfWeek,
      $or: [
        // Slots with no date range (available every week)
        { startDate: { $exists: false }, endDate: { $exists: false } },
        // Slots where selected date is within the date range
        {
          startDate: { $lte: selectedDate },
          endDate: { $gte: selectedDate }
        },
        // Slots with only start date (available from start date onward)
        {
          startDate: { $lte: selectedDate },
          endDate: { $exists: false }
        },
        // Slots with only end date (available until end date)
        {
          startDate: { $exists: false },
          endDate: { $gte: selectedDate }
        }
      ],
      isAvailable: true
    }).exec();
  },

  async markSlotAsBooked(slotId: string): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(
      slotId,
      { status: "booked", isAvailable: false },
      { new: true }
    ).exec();
  },

  async getSlotByDetails(doctorId: string, dayOfWeek: string, time: string): Promise<ISlot | null> {
    return await Slot.findOne({
      doctorId,
      dayOfWeek,
      startTime: { $lte: time },
      endTime: { $gte: time }
    }).exec();
  }
};