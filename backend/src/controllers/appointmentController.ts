import { Request, Response } from "express";
import { IAppointmentService } from "../interfaces/appointment/IAppointmentService";
import { INotificationService } from "../interfaces/notification/INotification";
import { DoctorService } from "../services/DoctorService";
import { DoctorRepository } from "../repositories/doctorRepository";

export class AppointmentController {
  constructor(
    private readonly appointmentService: IAppointmentService,
    private readonly notificationService: INotificationService,
    private readonly doctorService: DoctorService = new DoctorService(new DoctorRepository())
  ) {}

  async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await this.appointmentService.bookAppointment(req.body);
      
      // Send notification to doctor
      const doctor = await this.doctorService.getDoctorById(appointment.doctorId.toString());
      if (doctor) {
        const notification = await this.notificationService.createNotification({
          recipientId: appointment.doctorId.toString(),
          recipientRole: "doctor",
          message: `New appointment booked with you by ${req.user?.name || 'a patient'} on ${appointment.date} at ${appointment.time}`
        });

        (req as any).io.to(appointment.doctorId.toString()).emit("newNotification", notification);
      }

      res.status(201).json({
        message: "Appointment booked successfully!",
        appointment
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;
      
      const updatedAppointment = await this.appointmentService.updateAppointmentStatus(appointmentId, status);
      res.status(200).json({
        message: "Appointment updated successfully",
        updatedAppointment
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getDoctorAppointments(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.user?.id as string;
      const appointments = await this.appointmentService.getAppointmentsByDoctor(doctorId);
      res.status(200).json({ appointments });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPatientAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const appointments = await this.appointmentService.getAppointmentsByPatient(patientId);
      res.status(200).json({ appointments });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const appointments = await this.appointmentService.getAppointmentsByUserId(userId);
      res.status(200).json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.appointmentService.cancelAppointment(id);
      res.status(200).json({ message: "Appointment cancelled successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllAppointments(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await this.appointmentService.getAllAppointments();
      res.status(200).json({ appointments });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}