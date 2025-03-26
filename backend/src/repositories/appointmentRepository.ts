import { IAppointmentRepository } from "../interfaces/appointment/IAppointmentRepository";
import Appointment, { IAppointment } from "../models/appointment";
import { Types } from "mongoose";

export class AppointmentRepository implements IAppointmentRepository {
  async getById(id: string): Promise<IAppointment | null> {
    return Appointment.findById(id).exec();
  }

  async findByDetails(doctorId: string, date: string, time: string): Promise<IAppointment | null> {
    return Appointment.findOne({ doctorId, date, time }).exec();
  }

  async create(appointmentData: Omit<IAppointment, "_id">): Promise<IAppointment> {
    const appointment = new Appointment(appointmentData);
    return appointment.save();
  }

  async update(id: string, updateData: Partial<IAppointment>): Promise<IAppointment | null> {
    return Appointment.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await Appointment.findByIdAndDelete(id).exec();
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<IAppointment[]> {
    return Appointment.find({ doctorId })
      .populate("patientId", "name email phone")
      .exec();
  }

async getAppointmentsByPatient(patientId: string): Promise<IAppointment[]> {
  return Appointment.find({ patientId })
    .populate({
      path: 'doctorId',
      select: 'name specialty imageUrl address'
    })
    .exec();
}

  async getAllAppointments(): Promise<IAppointment[]> {
    return Appointment.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name speciality")
      .exec();
  }

async updatePaymentStatus(
  appointmentId: string | Types.ObjectId,
  paymentStatus: 'pending' | 'paid' | 'refunded',
  paymentId?: string
): Promise<IAppointment | null> {
  const appointmentIdStr = appointmentId.toString();
  
  const updateData: {
    paymentStatus: 'pending' | 'paid' | 'refunded';
    paymentId?: string;
    paidAt?: Date;
  } = { 
    paymentStatus,
    ...(paymentStatus === 'paid' && { paidAt: new Date() })
  };

  if (paymentId) {
    updateData.paymentId = paymentId;
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    appointmentIdStr,
    updateData,
    { new: true }
  ).exec();

  if (!updatedAppointment) {
    throw new Error(`Appointment not found for ID: ${appointmentIdStr}`);
  }

  return updatedAppointment;
}
}