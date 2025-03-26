import { ISlotDTO } from "../interfaces/ISlot";
import {ISlotRepository} from "../interfaces/ISlotRepository"
import { ISlotService } from "../interfaces/ISlotService";

class SlotService implements ISlotService {
  constructor(private slotRepository: ISlotRepository) {}

  async createSlot(slotData: ISlotDTO): Promise<ISlotDTO> {
    return await this.slotRepository.create(slotData);
  }

  async getSlotsByDoctorId(doctorId: string): Promise<ISlotDTO[]> {
    return await this.slotRepository.findByDoctorId(doctorId);
  }

  async updateSlot(slotId: string, updatedData: Partial<ISlotDTO>): Promise<ISlotDTO | null> {
    const slot = await this.slotRepository.update(slotId, updatedData);
    if (!slot) {
      throw new Error("Slot not found.");
    }
    return slot;
  }

  async getSlotsByDoctorAndDate(doctorId: string, date: string): Promise<ISlotDTO[]> {
    return await this.slotRepository.findByDoctorAndDate(doctorId, date);
  }

  async markSlotUnavailable(slotId: string): Promise<ISlotDTO | null> {
    return await this.slotRepository.markUnavailable(slotId);
  }

  async markSlotAvailable(slotId: string): Promise<ISlotDTO | null> {
    return await this.slotRepository.markAvailable(slotId);
  }

  async markSlotAsBooked(slotId: string): Promise<ISlotDTO | null> {
    const slot = await this.slotRepository.markBooked(slotId);
    if (!slot) {
      throw new Error("Slot not found.");
    }
    return slot;
  }

  async getSlotByDetails(doctorId: string, date: string, time: string): Promise<ISlotDTO | null> {
    return await this.slotRepository.findByDetails(doctorId, date, time);
  }
}

// Create an instance with the repository
import slotRepository from "../repositories/slotRepository";

const slotServiceInstance = new SlotService(slotRepository);

export default slotServiceInstance;