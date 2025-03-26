import slotRepository from "../repositories/slotRepository";
import { ISlot } from "../models/slot";

class SlotService {
  async addSlot(slotData: Partial<ISlot>): Promise<ISlot> {
    return await slotRepository.createSlot(slotData);
  }

  async getSlotsByDoctorId(doctorId: string): Promise<ISlot[]> {
    return await slotRepository.getSlotsByDoctorId(doctorId);
  }

  async updateSlot(slotId: string, updatedData: Partial<ISlot>): Promise<ISlot | null> {
    const slot = await slotRepository.updateSlot(slotId, updatedData);
    if (!slot) {
      throw new Error("Slot not found.");
    }
    return slot;
  }

  async markSlotUnavailable(slotId: string): Promise<ISlot | null> {
    return await slotRepository.markSlotUnavailable(slotId);
  }

  async markSlotAvailable(slotId: string): Promise<ISlot | null> {
    return await slotRepository.markSlotAvailable(slotId);
  }

  async getSlotsByDoctorAndDate(doctorId: string, date: string): Promise<ISlot[]> {
    return await slotRepository.getSlotsByDoctorAndDate(doctorId, date);
  }

  async markSlotAsBooked(slotId: string): Promise<ISlot | null> {
    const slot = await slotRepository.markSlotAsBooked(slotId);
    if (!slot) throw new Error("Slot not found.");
    return slot;
  }

async getSlotByDetails(doctorId: string, date: string, time: string): Promise<ISlot | null> {
  return await slotRepository.getSlotByDetails(doctorId, date, time);
}
}

export default new SlotService();