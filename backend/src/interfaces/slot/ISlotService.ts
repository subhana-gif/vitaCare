import { ISlot, ISlotCreate, ISlotUpdate } from "./ISlot";

export interface ISlotService {
  createSlot(slotData: ISlotCreate): Promise<ISlot>;
  getSlotsByDoctorId(doctorId: string): Promise<ISlot[]>;
  updateSlot(slotId: string, updatedData: ISlotUpdate): Promise<ISlot>;
  markSlotUnavailable(slotId: string): Promise<ISlot>;
  markSlotAvailable(slotId: string): Promise<ISlot>;
  getAvailableSlotsByDoctorAndDate(doctorId: string, date: string): Promise<ISlot[]>;
  bookSlot(slotId: string): Promise<ISlot>;
  getSlotByDetails(doctorId: string, date: string, time: string): Promise<ISlot>;
}