import { Document } from "mongoose";

export interface ISlot extends Document {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "available" | "booked";
  isAvailable: boolean;
}

export interface ISlotCreate {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface ISlotUpdate {
  price?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: "available" | "booked";
  isAvailable?: boolean;
}

export interface ISlotRepository {
  create(slotData: ISlotCreate): Promise<ISlot>;
  findByDoctorId(doctorId: string): Promise<ISlot[]>;
  findByIdAndUpdate(slotId: string, updatedData: ISlotUpdate): Promise<ISlot | null>;
  findByDoctorAndDate(doctorId: string, date: string): Promise<ISlot[]>;
  findAvailableByDoctorDateTime(doctorId: string, date: string, time: string): Promise<ISlot | null>;
}