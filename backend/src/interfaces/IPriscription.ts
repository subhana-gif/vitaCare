// src/interfaces/prescription.interface.ts
import { Document, Types } from 'mongoose';

export interface IMedicine {
  name: string;
  dosage: string;
  duration: string;
  timing: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  appointmentId: Types.ObjectId;
  medicines: IMedicine[];
  diagnosis: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionRepository {
  create(prescriptionData: Partial<IPrescription>): Promise<IPrescription>;
  findByAppointmentId(appointmentId: string): Promise<IPrescription | null>;
  updateByAppointmentId(appointmentId: string, updateData: Partial<IPrescription>): Promise<IPrescription | null>;
}

export interface IPrescriptionService {
  createPrescription(prescriptionData: Partial<IPrescription>): Promise<IPrescription>;
  getPrescriptionByAppointmentId(appointmentId: string): Promise<IPrescription | null>;
  updatePrescription(appointmentId: string, updateData: Partial<IPrescription>): Promise<IPrescription | null>;
}