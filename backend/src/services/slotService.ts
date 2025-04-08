import { Types } from "mongoose";
import slotRepository from "../repositories/slotRepository";
import { ISlot } from "../models/slot";

// Assuming slotRepository has these methods (update your repository accordingly)
interface SlotRepository {
  createSlot(slotData: Partial<ISlot>): Promise<ISlot>;
  getSlotsByDoctorId(doctorId: string): Promise<ISlot[]>;
  getSlotById(slotId: string): Promise<ISlot | null>;
  updateSlot(slotId: string, updatedData: Partial<ISlot>): Promise<ISlot | null>;
  markSlotUnavailable(slotId: string): Promise<ISlot | null>;
  markSlotAvailable(slotId: string): Promise<ISlot | null>;
  getSlotsByDoctorAndDay(doctorId: string, dayOfWeek: string): Promise<ISlot[]>;
  markSlotAsBooked(slotId: string): Promise<ISlot | null>;
  getSlotByDetails(doctorId: string, dayOfWeek: string, time: string): Promise<ISlot | null>;
}

class SlotService {
  async addSlot(
    doctorId: string,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    price: number,
    token: string
  ): Promise<ISlot> {
    if (!token) throw new Error("Token is required");

    // Convert doctorId to ObjectId
    const doctorObjectId = new Types.ObjectId(doctorId);

    // Validate no overlapping slots for the same day
    const existingSlots = await this.getSlotsByDoctorAndDay(doctorId, dayOfWeek);
    const newStart = new Date(`1970-01-01T${startTime}`);
    const newEnd = new Date(`1970-01-01T${endTime}`);

    for (const slot of existingSlots) {
      const existingStart = new Date(`1970-01-01T${slot.startTime}`);
      const existingEnd = new Date(`1970-01-01T${slot.endTime}`);
      if (newStart < existingEnd && newEnd > existingStart) {
        throw new Error(`Slot overlaps with existing slot on ${dayOfWeek}`);
      }
    }

    const slotData: Partial<ISlot> = {
      doctorId: doctorObjectId,
      dayOfWeek,
      startTime,
      endTime,
      price,
      status: "available",
      isAvailable: true,
    };
    return await slotRepository.createSlot(slotData);
  }

  async fetchSlots(doctorId: string, token: string): Promise<ISlot[]> {
    if (!doctorId || !token) throw new Error("Doctor ID and token are required");
    return await slotRepository.getSlotsByDoctorId(doctorId);
  }

  async updateSlot(slotId: string, updatedData: Partial<ISlot>, token: string): Promise<ISlot | null> {
    if (!token) throw new Error("Token is required");

    const slot = await slotRepository.getSlotById(slotId);
    if (!slot) throw new Error("Slot not found");

    if (updatedData.startTime || updatedData.endTime) {
      const startTime = updatedData.startTime || slot.startTime;
      const endTime = updatedData.endTime || slot.endTime;
      const existingSlots = await this.getSlotsByDoctorAndDay(
        slot.doctorId.toString(),
        slot.dayOfWeek
      );

      const newStart = new Date(`1970-01-01T${startTime}`);
      const newEnd = new Date(`1970-01-01T${endTime}`);

      for (const existing of existingSlots) {
        if (existing._id.toString() === slotId) continue;
        const existingStart = new Date(`1970-01-01T${existing.startTime}`);
        const existingEnd = new Date(`1970-01-01T${existing.endTime}`);
        if (newStart < existingEnd && newEnd > existingStart) {
          throw new Error("Updated slot overlaps with existing slot");
        }
      }
    }

    const updatedSlot = await slotRepository.updateSlot(slotId, updatedData);
    if (!updatedSlot) throw new Error("Slot not found");
    return updatedSlot;
  }

  async markSlotUnavailable(slotId: string, token: string): Promise<ISlot | null> {
    if (!token) throw new Error("Token is required");
    return await slotRepository.markSlotUnavailable(slotId);
  }

  async markSlotAvailable(slotId: string, token: string): Promise<ISlot | null> {
    if (!token) throw new Error("Token is required");
    return await slotRepository.markSlotAvailable(slotId);
  }

  async getSlotsByDoctorAndDay(doctorId: string, dayOfWeek: string): Promise<ISlot[]> {
    return await slotRepository.getSlotsByDoctorAndDay(doctorId, dayOfWeek);
  }

  async getSlotById(slotId: string): Promise<ISlot | null> {
    return await slotRepository.getSlotById(slotId);
  }

  async markSlotAsBooked(slotId: string): Promise<ISlot | null> {
    const slot = await slotRepository.markSlotAsBooked(slotId);
    if (!slot) throw new Error("Slot not found");
    return slot;
  }

  async getSlotByDetails(doctorId: string, dayOfWeek: string, time: string): Promise<ISlot | null> {
    return await slotRepository.getSlotByDetails(doctorId, dayOfWeek, time);
  }
}

export default new SlotService();