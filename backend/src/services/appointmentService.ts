import { AppointmentRepository } from "../repositories/appointmentRepository";
import { IAppointment } from "../models/appointment";
import PaymentService from "./paymentService";

interface AppointmentData {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  appointmentFee: number;
}

export class AppointmentService {
  private appointmentRepository = new AppointmentRepository();
  private paymentService: typeof PaymentService = PaymentService;
  static appointmentRepository: any;

  async bookAppointment(appointmentData: AppointmentData): Promise<IAppointment> {
    const { doctorId, date, time } = appointmentData;

    const existingAppointment = await this.appointmentRepository.findByDetails(
      doctorId,
      date,
      time
    );

    if (existingAppointment) {
      throw new Error("This slot is already booked. Please choose another time.");
    }

    return await this.appointmentRepository.create(appointmentData);
  }

  async getAppointmentsByUserId(userId: string) {
    return await this.appointmentRepository.getAppointments({ patientId: userId });
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: IAppointment["status"]
  ) {
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      throw new Error("Invalid status value.");
    }
  
    const appointment = await this.appointmentRepository.findById(appointmentId);
  
    if (!appointment) {
      throw new Error("Appointment not found.");
    }
  
    const updatedData: Partial<IAppointment> = {
      status,
      ...(status === 'completed' && { paymentStatus: 'paid' })
    };
  
    return await this.appointmentRepository.updateStatus(appointmentId, updatedData);
  }
  
  async getAppointmentsByDoctor(doctorId: string) {
    return await this.appointmentRepository.getAppointmentsByDoctor(doctorId);
  }

  async getAppointmentsByPatient(patientId: string) {
    return await this.appointmentRepository.getAppointmentsByPatient(patientId);
  }

  static markAsPaid(appointmentId: string) {
    return this.appointmentRepository.updatePaymentStatus(appointmentId, {
      paymentStatus: "Paid",
      paid: true,
    });
  }

  async cancelAppointment(appointmentId: string) {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    
    if (!appointment) {
      throw new Error("Appointment not found.");
    }

    if (appointment.status === 'cancelled') {
      throw new Error("Appointment is already cancelled.");
    }

    // Check if payment status is paid and process refund
    if (appointment.paymentStatus === 'paid') {
      try {
        // Get payment details from the appointment and process refund
        const refundSuccess = await this.paymentService.processRefund(
          appointmentId,
          appointment.paymentId // Access paymentId directly from appointment
        );

        if (!refundSuccess) {
          throw new Error("Failed to process refund");
        }
      } catch (error) {
        console.error("Refund Error:", error);
        throw new Error("Failed to process refund. Please try again later.");
      }
    }

    // Update appointment status to cancelled
    return await this.appointmentRepository.updateStatus(appointmentId, {
      status: 'cancelled'
    });
  }

  async getAllAppointments(): Promise<IAppointment[]> {
    return await this.appointmentRepository.getAllAppointments();
  }
}
