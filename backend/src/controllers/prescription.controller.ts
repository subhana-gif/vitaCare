import { Request, Response } from 'express';
import { PrescriptionService } from '../services/priscriptionService';
import  {INotificationService}  from '../interfaces/notification/INotification';
import { Types } from 'mongoose';
import { AppointmentService } from '../services/appointmentService';
import notificationService from '../services/notificationService';
import { AppointmentRepository } from '../repositories/appointmentRepository';
import { DoctorRepository } from '../repositories/doctorRepository';
import { IAppointmentRepository } from '../interfaces/appointment/IAppointmentRepository';
import { IDoctorRepository } from '../interfaces/doctor/IDoctorRepository';
import { DoctorService } from '../services/DoctorService';

export class PrescriptionController {
  private prescriptionService: PrescriptionService;
  private notificationService: INotificationService;
  private appointmentService: AppointmentService; 
  private doctorService: DoctorService;

  constructor(
    appointmentRepository?: IAppointmentRepository,
    doctorRepository?: IDoctorRepository
  ) {
    this.prescriptionService = new PrescriptionService();
    this.notificationService = notificationService; 
    this.doctorService = new DoctorService(doctorRepository || new DoctorRepository());
    this.appointmentService = new AppointmentService(
        appointmentRepository || new AppointmentRepository(),
        new DoctorService(doctorRepository || new DoctorRepository())
      );
  }

  public createPrescription = async (req: Request, res: Response): Promise<void> =>{
    try {
      const { appointmentId, medicines, diagnosis, notes } = req.body;

      if (!Types.ObjectId.isValid(appointmentId)) {
        res.status(400).json({ message: "Invalid appointment ID" });
        return;
      }
      const prescription = await this.prescriptionService.createPrescription({
        appointmentId: new Types.ObjectId(appointmentId),
        medicines,
        diagnosis,
        notes
      });

      const appointment = await this.appointmentService.getAppointmentById(appointmentId);
      if (!appointment) {
        res.status(404).json({ message: "Appointment not found" });
        return;
      }
      const doctor = await this.doctorService.getDoctorById(appointment.doctorId.toString());
      if (!doctor) {
        res.status(404).json({ message: "Doctor not found" });
        return;
      }
  
        if (appointment) {
          const notification = await this.notificationService.createNotification({
          recipientId: appointment.patientId.toString(),
          recipientRole: "user",
          message: `Your prescription for appointment with doctor ${doctor.name} on 
          ${appointment.date} at ${appointment.time} has been ${req.method === 'POST' ? 'created' : 'updated'}.`,
        });

        (req as any).io.to(appointment.patientId.toString()).emit("newNotification", notification);
      }

      res.status(201).json({
        success: true,
        message: "Prescription processed successfully",
        data: prescription,
      });
    } catch (error: any) {
      console.error("Error processing prescription:", error);
      res.status(500).json({
        message: error.message || "Failed to process prescription",
      });
    }
  };

  public getPrescriptionByAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { appointmentId } = req.params;

      const prescription = await this.prescriptionService.getPrescriptionByAppointment(appointmentId);
      if (!prescription) {
        res.status(404).json({ message: 'Prescription not found' });
        return;
      }

      res.json(prescription);
    } catch (error: any) {
      console.error('Error fetching prescription:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to fetch prescription' 
      });
    }
  };

  public downloadPrescription = async (req: Request, res: Response): Promise<void>=> {
    try {
      const { appointmentId } = req.params;

      const prescription = await this.prescriptionService.getPrescriptionByAppointment(appointmentId);
      if (!prescription) {
        res.status(404).json({ message: 'Prescription not found' });
        return;
      }
      const pdfBuffer = await this.prescriptionService.generatePdfContent(prescription);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=prescription_${appointmentId}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Error generating prescription PDF:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate prescription PDF' 
      });
    }
  };
}