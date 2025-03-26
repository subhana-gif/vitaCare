import { ISlotDTO } from "./ISlot";

export interface ISlotRepository {
    create(slot: ISlotDTO): Promise<ISlotDTO>;
    findById(id: string): Promise<ISlotDTO | null>;
    findByDoctorId(doctorId: string): Promise<ISlotDTO[]>;
    findByDoctorAndDate(doctorId: string, date: string): Promise<ISlotDTO[]>;
    findByDetails(doctorId: string, date: string, time: string): Promise<ISlotDTO | null>;
    update(id: string, data: Partial<ISlotDTO>): Promise<ISlotDTO | null>;
    markUnavailable(id: string): Promise<ISlotDTO | null>;
    markAvailable(id: string): Promise<ISlotDTO | null>;
    markBooked(id: string): Promise<ISlotDTO | null>;
  }