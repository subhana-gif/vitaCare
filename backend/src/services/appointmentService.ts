import { IAppointmentService } from "../interfaces/appointment/IAppointmentService";
import { IAppointmentRepository } from "../interfaces/appointment/IAppointmentRepository";
import { IAppointment } from "../models/appointment";
import { DoctorService } from "./DoctorService";
import {UserService} from "./userService";
import UserRepository from "../repositories/userRepository";
import emailService from "./emailService";
import slotService from "./slotService";
import AppointmentReminderService from "./appointmentReminderService";
import notificationService from "./notificationService";
import { sendCallReminder } from "../config/twilioCall";
import schedule from "node-schedule";
import { IUserService } from "../interfaces/user/IUserservice";
import {Dayjs} from "dayjs";
import {  ISlot } from "../models/slot"; // Adjust path to your types file
import dayjs from 'dayjs';





export class AppointmentService implements IAppointmentService {
  userService: IUserService;
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly doctorService: DoctorService,
    userService?: IUserService 
  ) {
    this.userService = userService || new UserService(UserRepository.getInstance());
  }
    
  async bookAppointment(appointmentData: Omit<IAppointment, "_id">): Promise<IAppointment> {
    const { doctorId, date, time, patientId, slotId } = appointmentData;
  
    // Fetch slot by ID
    const slot: ISlot | null = await slotService.getSlotById(slotId);
    if (!slot) {
      throw new Error("Slot not found");
    }
    if (slot.doctorId.toString() !== doctorId.toString()) {
      throw new Error("Slot doesn't belong to this doctor");
    }
  
    // Validate dayOfWeek matches date
    if (!date || typeof date !== "string") {
      throw new Error("Invalid date provided");
    }
const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' });
    if (slot.dayOfWeek !== dayOfWeek) {
      throw new Error("Selected date doesn’t match slot’s day of week");
    }
  
    // Validate time is within slot range and on 15-minute interval
    if (!slot.startTime || !slot.endTime || !time) {
      throw new Error("Invalid time data in slot or request");
    }
    
    const startTime = dayjs(`2000-01-01 ${slot.startTime}`);
    const endTime = dayjs(`2000-01-01 ${slot.endTime}`);
    const selectedTime = dayjs(`2000-01-01 ${time}`);
  
    if (typeof startTime === 'undefined' || typeof endTime === 'undefined' || typeof selectedTime === 'undefined') {
      throw new Error("Invalid time format in slot or request");
    }
  
    if (
      selectedTime.isBefore(startTime) ||
      selectedTime.isAfter(endTime) ||
      selectedTime.diff(startTime, "minute") % 15 !== 0
    ) {
      throw new Error("Selected time is outside slot range or not on 15-minute interval");
    }
  
    // Check for existing appointment
    const existingAppointment = await this.appointmentRepository.findByDetails(doctorId.toString(), date, time);
    if (existingAppointment) {
      throw new Error("This slot is already booked");
    }
  
    // Create appointment
    const appointment = await this.appointmentRepository.create({
      ...appointmentData,
      appointmentFee: slot.price,
    });
  
    await this.sendConfirmationAndReminders(appointment);
    return appointment;
  }
  
  private async sendConfirmationAndReminders(appointment: IAppointment): Promise<void> {
    const [doctor, patient] = await Promise.all([
      this.doctorService.getDoctorById(appointment.doctorId.toString()),
      this.userService.getUserProfile(appointment.patientId.toString())
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
          `Hello ${patient.name}, this is a reminder for your appointment with doctor. ${doctor.name} at ${appointment.time}.`
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
    return this.appointmentRepository.getAppointmentsByPatient(userId);
  }

  async getAppointmentById(id: string): Promise<IAppointment | null> {
    return this.appointmentRepository.getById(id);
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

