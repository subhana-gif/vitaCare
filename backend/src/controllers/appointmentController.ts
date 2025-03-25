import { Request, Response } from "express";
import { IAppointmentService } from "../services/IAppointmentService";

export class AppointmentController {
  constructor(private readonly appointmentService: IAppointmentService) {}

  async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await this.appointmentService.bookAppointment(req.body);
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