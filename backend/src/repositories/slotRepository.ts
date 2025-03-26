import SlotModel from "../models/slot";
import { ISlotDTO } from "../interfaces/ISlot";
import {ISlotRepository} from "../interfaces/ISlotRepository"

class SlotRepository implements ISlotRepository {
  async create(slotData: ISlotDTO): Promise<ISlotDTO> {
    const slot = await SlotModel.create(slotData);
    return this.toDTO(slot);
  }

  async findById(id: string): Promise<ISlotDTO | null> {
    const slot = await SlotModel.findById(id);
    return slot ? this.toDTO(slot) : null;
  }

  async findByDoctorId(doctorId: string): Promise<ISlotDTO[]> {
    const slots = await SlotModel.find({ doctorId });
    return slots.map(slot => this.toDTO(slot));
  }

  async findByDoctorAndDate(doctorId: string, date: string): Promise<ISlotDTO[]> {
    const slots = await SlotModel.find({ 
      doctorId, 
      date, 
      isAvailable: true 
    });
    return slots.map(slot => this.toDTO(slot));
  }

  async findByDetails(doctorId: string, date: string, time: string): Promise<ISlotDTO | null> {
    const slot = await SlotModel.findOne({ 
      doctorId, 
      date,
      startTime: { $lte: time },
      endTime: { $gt: time },
      isAvailable: true 
    });
    return slot ? this.toDTO(slot) : null;
  }

  async update(id: string, updatedData: Partial<ISlotDTO>): Promise<ISlotDTO | null> {
    const slot = await SlotModel.findByIdAndUpdate(id, updatedData, { new: true });
    return slot ? this.toDTO(slot) : null;
  }

  async markUnavailable(id: string): Promise<ISlotDTO | null> {
    const slot = await SlotModel.findByIdAndUpdate(
      id, 
      { isAvailable: false }, 
      { new: true }
    );
    return slot ? this.toDTO(slot) : null;
  }

  async markAvailable(id: string): Promise<ISlotDTO | null> {
    const slot = await SlotModel.findByIdAndUpdate(
      id, 
      { isAvailable: true }, 
      { new: true }
    );
    return slot ? this.toDTO(slot) : null;
  }

  async markBooked(id: string): Promise<ISlotDTO | null> {
    const slot = await SlotModel.findByIdAndUpdate(
      id, 
      { status: "booked", isAvailable: false }, 
      { new: true }
    );
    return slot ? this.toDTO(slot) : null;
  }

  // Utility method to convert Mongoose document to DTO
  private toDTO(slot: any): ISlotDTO {
    return {
      id: slot._id.toString(),
      doctorId: slot.doctorId.toString(),
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      status: slot.status,
      isAvailable: slot.isAvailable
    };
  }
}

export default new SlotRepository();