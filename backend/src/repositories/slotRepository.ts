import Slot, { ISlot } from "../models/slot";

class SlotRepository {
  // ✅ Create Slot
  async createSlot(slotData: Partial<ISlot>): Promise<ISlot> {
    return await Slot.create(slotData);
  }

  // ✅ Get Slots by Doctor ID
  async getSlotsByDoctorId(doctorId: string): Promise<ISlot[]> {
    return await Slot.find({ doctorId });
  }

  // ✅ Update Slot Price
  async updateSlot(slotId: string, updatedData: Partial<ISlot>): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(slotId, updatedData, { new: true });
  }
  // ✅ Delete Slot
  async markSlotUnavailable(slotId: string): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(slotId, { isAvailable: false }, { new: true });
  }

  // ✅ Mark Slot as Available (Restore Soft Deleted Slot)
  async markSlotAvailable(slotId: string): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(slotId, { isAvailable: true }, { new: true });
  }

  async getSlotsByDoctorAndDate(doctorId: string, date: string): Promise<ISlot[]> {
    return await Slot.find({ doctorId, date, isAvailable: true });
  }

  // ✅ Mark Slot as Booked
  async markSlotAsBooked(slotId: string): Promise<ISlot | null> {
    return await Slot.findByIdAndUpdate(slotId, { status: "booked", isAvailable: false }, { new: true });
  }

  // ✅ Get Slot by Doctor ID, Date, and Time
  async getSlotByDetails(doctorId: string, date: string, time: string): Promise<ISlot | null> {
    return await Slot.findOne({ 
        doctorId, 
        date,
        startTime: { $lte: time },   // ✅ Time should be greater than or equal to startTime
        endTime: { $gt: time },      // ✅ Time should be less than endTime
        isAvailable: true 
    });
}

}

export default new SlotRepository();
