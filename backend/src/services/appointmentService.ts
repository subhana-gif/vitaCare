import { IAppointmentService } from "../services/IAppointmentService";
import { IAppointmentRepository } from "../repositories/IAppointmentRepository";
import { IAppointment } from "../models/appointment";
import { DoctorService } from "./DoctorService";
import userService from "./userService";
import emailService from "./emailService";
import slotService from "./slotService";
import AppointmentReminderService from "./appointmentReminderService";
import notificationService from "./notificationService";
import { sendCallReminder } from "../config/twilioCall";
import schedule from "node-schedule";
import logger from "../utils/logger";


export class AppointmentService implements IAppointmentService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly doctorService: DoctorService
  ) {}

  async bookAppointment(appointmentData: Omit<IAppointment, "_id">): Promise<IAppointment> {
    const { doctorId, date, time, patientId } = appointmentData;

    const slot = await slotService.getSlotByDetails(doctorId.toString(), date, time);
    if (!slot) {
      throw new Error("Slot not found or unavailable");
    }

    const existingAppointment = await this.appointmentRepository.findByDetails(doctorId.toString(), date, time);
    if (existingAppointment) {
      throw new Error("This slot is already booked");
    }

    const appointment = await this.appointmentRepository.create({
      ...appointmentData,
      appointmentFee: slot.price
    });

    await this.sendConfirmationAndReminders(appointment);
    return appointment;
  }

  private async sendConfirmationAndReminders(appointment: IAppointment): Promise<void> {
    const [doctor, patient] = await Promise.all([
      this.doctorService.getDoctorById(appointment.doctorId.toString()),
      userService.getUserProfile(appointment.patientId.toString())
    ]);

    if (!doctor || !patient) {
      throw new Error("Doctor or patient not found");
    }

    // Send confirmation email
    await emailService.sendAppointmentConfirmationEmail(
      patient.email,
      {
        patientName: patient.name,
        doctorName: doctor.name,
        date: appointment.date,
        time: appointment.time,
        appointmentFee: appointment.appointmentFee,
        location: doctor.address
      }
    );

    // Schedule reminders
    await AppointmentReminderService.scheduleReminders(appointment);

    // Schedule call reminder
    if (patient.phone) {
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const reminderTime = new Date(appointmentDateTime.getTime() - 30 * 60000);
      
      schedule.scheduleJob(reminderTime, () => {
        sendCallReminder(
          patient.phone as string,
          `Hello ${patient.name}, this is a reminder for your appointment with Dr. ${doctor.name} at ${appointment.time}.`
        );
      });
    }

    // Send notification to doctor
    await notificationService.createNotification({
      recipientId: appointment.doctorId.toString(),
      recipientRole: "doctor",
      message: `New appointment booked with ${patient.name} on ${appointment.date} at ${appointment.time}.`,
    });
  }

  async getAppointmentsByUserId(userId: string): Promise<IAppointment[]> {
    logger.info(`Appointment get request for userid: ${userId}`);

    return this.appointmentRepository.getAppointmentsByPatient(userId);
  }

  async updateAppointmentStatus(appointmentId: string, status: IAppointment["status"]): Promise<IAppointment> {
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      throw new Error("Invalid status value");
    }

    const updateData: Partial<IAppointment> = {
      status,
      ...(status === 'completed' && { paymentStatus: 'paid' })
    };

    const updatedAppointment = await this.appointmentRepository.update(appointmentId, updateData);
    if (!updatedAppointment) {
      throw new Error("Appointment not found");
    }

    await this.sendStatusUpdateNotification(updatedAppointment);
    return updatedAppointment;
  }

  private async sendStatusUpdateNotification(appointment: IAppointment): Promise<void> {
    await notificationService.createNotification({
      recipientId: appointment.patientId.toString(),
      recipientRole: "user",
      message: `Your appointment status has been changed to ${appointment.status}`
    });
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<IAppointment[]> {
    return this.appointmentRepository.getAppointmentsByDoctor(doctorId);
  }

  async getAppointmentsByPatient(patientId: string): Promise<IAppointment[]> {
    return this.appointmentRepository.getAppointmentsByPatient(patientId);
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentRepository.getById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.status === 'cancelled') {
      throw new Error("Appointment is already cancelled");
    }

    await this.appointmentRepository.update(appointmentId, { status: 'cancelled' });
  }

  async getAllAppointments(): Promise<IAppointment[]> {
    return this.appointmentRepository.getAllAppointments();
  }
}