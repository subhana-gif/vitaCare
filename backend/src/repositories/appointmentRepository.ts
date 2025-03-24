import { UpdateQuery } from "mongoose";
import appointment from "../models/appointment";
import Appointment, { IAppointment } from "../models/appointment";

interface AppointmentData {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus?: "pending" | "paid" | "refunded";
  appointmentFee: number;
}

export class AppointmentRepository {
  async delete(appointmentId: string): Promise<void> {
    await Appointment.findByIdAndDelete(appointmentId);
  }
  
  async getAppointments({ patientId }: { patientId: string }) {
    return await appointment.find({ patientId }).populate("doctorId") .sort({ createdAt: -1 })
    .exec();
  }
  // ✅ Create Appointment
  async create(appointmentData: AppointmentData): Promise<IAppointment> {
    const appointment = new Appointment(appointmentData);
    return await appointment.save();
  }

  // ✅ Find Appointment by Details (to avoid duplicate bookings)
  async findByDetails(
    doctorId: string,
    date: string,
    time: string
  ): Promise<IAppointment | null> {
    return await Appointment.findOne({ doctorId, date, time });
  }


    async updateStatus(appointmentId: string, updateData: Partial<IAppointment>) {
      return await Appointment.findByIdAndUpdate(
        appointmentId,
        { $set: updateData }, // ✅ Ensures correct data structure
        { new: true }
      );
    }
  
    async getById(appointmentId: string) {
      return await Appointment.findById(appointmentId);
    }
  
  
    async updatePaymentStatus(appointmentId: string, paymentStatus: string, paymentId?: string): Promise<IAppointment | null> {
      const updateData: { paymentStatus: string; paymentId?: string } = { paymentStatus };
      if (paymentId) {
          updateData.paymentId = paymentId;
      }
  
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true } // ✅ Ensures the updated data is returned
      );
  
      console.log("✅ Updated Appointment:", updatedAppointment);
      
      if (!updatedAppointment) {
          console.error(`❌ Appointment not found for ID: ${appointmentId}`);
      }
  
      return updatedAppointment;
  }
  
  async findAll(): Promise<IAppointment[]> {
    return await Appointment.find().populate("patientId doctorId", "name email");
  }
  
  // ✅ Get Appointments by Doctor
  async getAppointmentsByDoctor(doctorId: string): Promise<IAppointment[]> {
    return await Appointment.find({ doctorId }).populate({
      path: 'patientId', // Assuming `patientId` is the field that references the Patient model
      select: 'name email phone gender dob', // Select relevant patient details
    });
  }
  
  // ✅ Get Appointments by Patient
  async getAppointmentsByPatient(patientId: string): Promise<IAppointment[]> {
    return await Appointment.find({ patientId });
  }

  async updateAppointmentStatus(
    appointmentId: string, 
    updateData: UpdateQuery<any>
  ) {
    return  Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updateData }, // Set only the provided fields
      { new: true } // Return the updated document
    );
  }

  async findById(appointmentId: string) {
    return await Appointment.findById(appointmentId);
  }

  async findByDoctorId(doctorId: string): Promise<IAppointment[]> {
    return await Appointment.find({ doctorId }).populate("patientId", "name");
  }

  async findByPatientId(patientId: string): Promise<IAppointment[]> {
    return await Appointment.find({ patientId }).populate("doctorId", "name");
  }

  async updateAppointment(appointmentId: string, updateData: Partial<IAppointment>): Promise<IAppointment | null> {
    return await Appointment.findByIdAndUpdate(appointmentId, updateData, { new: true }).exec();
}

async getAllAppointments(): Promise<IAppointment[]> {
  return await Appointment.find().populate("doctorId").populate("patientId");
}
}
