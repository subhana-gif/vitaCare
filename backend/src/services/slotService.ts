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
    token: string,
    startDate?: string,
    endDate?: string
  ): Promise<ISlot> {
    if (!token) throw new Error("Token is required");

    const doctorObjectId = new Types.ObjectId(doctorId);
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    // Validate date range if provided
    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      throw new Error("Start date cannot be after end date");
    }

    // Check for overlapping slots considering date range
    const existingSlots = await this.getSlotsByDoctorAndDay(doctorId, dayOfWeek,new Date());
    const newStart = new Date(`1970-01-01T${startTime}`);
    const newEnd = new Date(`1970-01-01T${endTime}`);

    for (const slot of existingSlots) {
      // Skip if date ranges don't overlap
      if (parsedStartDate && parsedEndDate && slot.startDate && slot.endDate) {
        if (parsedEndDate < slot.startDate || parsedStartDate > slot.endDate) {
          continue;
        }
      }

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
      startDate: parsedStartDate,
      endDate: parsedEndDate
    };
    
    return await slotRepository.createSlot(slotData);
  }

  async updateSlot(
    slotId: string,
    updatedData: {
      price?: number;
      date?: string;
      startTime?: string;
      endTime?: string;
      startDate?: string;
      endDate?: string;
    },
    token: string
  ): Promise<ISlot | null> {
    if (!token) throw new Error("Token is required");

    const slot = await slotRepository.getSlotById(slotId);
    if (!slot) throw new Error("Slot not found");

    // Parse dates if provided
    const parsedStartDate = updatedData.startDate ? new Date(updatedData.startDate) : undefined;
    const parsedEndDate = updatedData.endDate ? new Date(updatedData.endDate) : undefined;

    // Validate date range if provided
    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      throw new Error("Start date cannot be after end date");
    }

    if (updatedData.startTime || updatedData.endTime) {
      const startTime = updatedData.startTime || slot.startTime;
      const endTime = updatedData.endTime || slot.endTime;
      const existingSlots = await this.getSlotsByDoctorAndDay(
        slot.doctorId.toString(),
        slot.dayOfWeek,
        new Date()
      );

      const newStart = new Date(`1970-01-01T${startTime}`);
      const newEnd = new Date(`1970-01-01T${endTime}`);

      for (const existing of existingSlots) {
        if (existing._id.toString() === slotId) continue;
        
        // Skip if date ranges don't overlap
        if (parsedStartDate && parsedEndDate && existing.startDate && existing.endDate) {
          if (parsedEndDate < existing.startDate || parsedStartDate > existing.endDate) {
            continue;
          }
        }

        const existingStart = new Date(`1970-01-01T${existing.startTime}`);
        const existingEnd = new Date(`1970-01-01T${existing.endTime}`);
        if (newStart < existingEnd && newEnd > existingStart) {
          throw new Error("Updated slot overlaps with existing slot");
        }
      }
    }

    const updatePayload: Partial<ISlot> = {
      ...updatedData,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    };

    const updatedSlot = await slotRepository.updateSlot(slotId, updatePayload);
    if (!updatedSlot) throw new Error("Slot not found");
    return updatedSlot;
  }
  
  async fetchSlots(doctorId: string, token: string): Promise<ISlot[]> {
    if (!doctorId || !token) throw new Error("Doctor ID and token are required");
    return await slotRepository.getSlotsByDoctorId(doctorId);
  }

  async markSlotUnavailable(slotId: string, token: string): Promise<ISlot | null> {
    if (!token) throw new Error("Token is required");
    return await slotRepository.markSlotUnavailable(slotId);
  }

  async markSlotAvailable(slotId: string, token: string): Promise<ISlot | null> {
    if (!token) throw new Error("Token is required");
    return await slotRepository.markSlotAvailable(slotId);
  }

  async getSlotsByDoctorAndDay(doctorId: string, dayOfWeek: string, selectedDate: Date): Promise<ISlot[]> {
    return await slotRepository.getSlotsByDoctorAndDay(doctorId, dayOfWeek,selectedDate);
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