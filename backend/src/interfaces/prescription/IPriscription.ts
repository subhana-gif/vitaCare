import { Types } from 'mongoose';

export interface IMedicine {
  name: string;
  dosage: string;
  duration: string;
  timing: string;
  instructions?: string;
}

export interface IPrescription {
  appointmentId: Types.ObjectId;
  medicines: IMedicine[];
  diagnosis: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPrescriptionRepository {
  create(prescriptionData: IPrescription): Promise<IPrescription>;
  findByAppointmentId(appointmentId: string): Promise<IPrescription | null>;
  updateByAppointmentId(appointmentId: string, updateData: Partial<IPrescription>): Promise<IPrescription | null>;
}