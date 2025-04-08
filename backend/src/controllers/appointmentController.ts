import { Request, Response } from "express";
import { IAppointmentService } from "../interfaces/appointment/IAppointmentService";
import { INotificationService } from "../interfaces/notification/INotification";
import { DoctorService } from "../services/DoctorService";
import { DoctorRepository } from "../repositories/doctorRepository";
import { HttpStatus,HttpMessage } from '../enums/HttpStatus';


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
          message: `New appointment booked with you by ${req.user?.name || 'a patient'} on ${appointment.date} at ${appointment.time}`,
        });
  
        req.io?.to(appointment.doctorId.toString()).emit("newNotification", notification);
      }
  
      res.status(HttpStatus.CREATED).json({
        message: HttpMessage.CREATED,
        appointment,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST});
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
    }
  }
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;
      
      const updatedAppointment = await this.appointmentService.updateAppointmentStatus(appointmentId, status);
      res.status(HttpStatus.OK).json({
        message: HttpMessage.OK,
        updatedAppointment
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
    }
  }

  async getDoctorAppointments(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.user?.id as string;
      const appointments = await this.appointmentService.getAppointmentsByDoctor(doctorId);
      res.status(HttpStatus.CREATED).json({ appointments });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
    }
  }

  async getPatientAppointments(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const appointments = await this.appointmentService.getAppointmentsByPatient(patientId);
      res.status(HttpStatus.OK).json({ appointments });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
    }
  }

  async getAppointments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id as string;
      const appointments = await this.appointmentService.getAppointmentsByUserId(userId);
      res.status(HttpStatus.OK).json(appointments);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
    }
  }

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.appointmentService.cancelAppointment(id);
      res.status(HttpStatus.OK).json({ message: HttpMessage.OK });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
    }
  }

  async getAllAppointments(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await this.appointmentService.getAllAppointments();
      res.status(HttpStatus.OK).json({ appointments });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
    }
  }
}