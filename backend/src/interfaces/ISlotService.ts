import { ISlotDTO } from "./ISlot";

export interface ISlotService {
    createSlot(slotData: ISlotDTO): Promise<ISlotDTO>;
    getSlotsByDoctorId(doctorId: string): Promise<ISlotDTO[]>;
    updateSlot(slotId: string, updatedData: Partial<ISlotDTO>): Promise<ISlotDTO | null>;
    getSlotsByDoctorAndDate(doctorId: string, date: string): Promise<ISlotDTO[]>;
    markSlotUnavailable(slotId: string): Promise<ISlotDTO | null>;
    markSlotAvailable(slotId: string): Promise<ISlotDTO | null>;
    markSlotAsBooked(slotId: string): Promise<ISlotDTO | null>;
    getSlotByDetails(doctorId: string, date: string, time: string): Promise<ISlotDTO | null>;
}