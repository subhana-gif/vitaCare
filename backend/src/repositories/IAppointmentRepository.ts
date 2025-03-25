import { Types } from "mongoose";
import { IAppointment } from "../models/appointment";

export interface IAppointmentReader {
  getById(id: string): Promise<IAppointment | null>;
  findByDetails(doctorId: string, date: string, time: string): Promise<IAppointment | null>;
  getAppointmentsByDoctor(doctorId: string): Promise<IAppointment[]>;
  getAppointmentsByPatient(patientId: string): Promise<IAppointment[]>;
  getAllAppointments(): Promise<IAppointment[]>;
  updatePaymentStatus(appointmentId: string,paymentStatus: 'pending' | 'paid' | 'refunded',paymentId?: string): Promise<IAppointment | null>;
}

export interface IAppointmentWriter {
  create(appointment: Omit<IAppointment, "_id">): Promise<IAppointment>;
  update(id: string, updateData: Partial<IAppointment>): Promise<IAppointment | null>;
  delete(id: string): Promise<void>;
}

export interface IAppointmentRepository extends IAppointmentReader, IAppointmentWriter {}