import { IPrescriptionService } from "../interfaces/IPrescriptionService";
import { IPrescription } from "../interfaces/IPriscription";
import { PrescriptionRepository } from "../repositories/priscriptionRepository";
import { AppointmentService } from "../services/appointmentService";
import { DoctorService } from "../services/DoctorService";
import  {IUserService}  from "../interfaces/IUserservice";
import {UserService} from "./userService";
import PDFDocument from "pdfkit";
import UserRepository from "../repositories/userRepository";
import { AppointmentRepository } from "../repositories/appointmentRepository";
import { DoctorRepository } from "../repositories/doctorRepository";
import { IAppointmentRepository } from "../repositories/IAppointmentRepository";
import { IDoctorRepository } from "../repositories/IDoctorRepository";

export class PrescriptionService implements IPrescriptionService {
  private prescriptionRepository: PrescriptionRepository;
  private appointmentService: AppointmentService;
  private doctorService: DoctorService;
  private userService: IUserService;

  constructor(
    userService?: IUserService,
    appointmentRepository?: IAppointmentRepository,
    doctorRepository?: IDoctorRepository
  ) {
    this.prescriptionRepository = new PrescriptionRepository();
    this.appointmentService = new AppointmentService(
        appointmentRepository || new AppointmentRepository(),
        new DoctorService(doctorRepository || new DoctorRepository())
      );
      this.doctorService = new DoctorService(
        doctorRepository || new DoctorRepository()
      );    this.userService = userService || new UserService(UserRepository.getInstance());
  }

  async createPrescription(prescriptionData: IPrescription): Promise<IPrescription> {
    const appointment = await this.appointmentService.getAppointmentById(prescriptionData.appointmentId.toString());
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    
    const existingPrescription = await this.prescriptionRepository.findByAppointmentId(prescriptionData.appointmentId.toString());
    
    if (existingPrescription) {
      return await this.prescriptionRepository.updateByAppointmentId(
        prescriptionData.appointmentId.toString(),
        prescriptionData
      ) as IPrescription;
    }

    return await this.prescriptionRepository.create(prescriptionData);
  }

  async getPrescriptionByAppointment(appointmentId: string): Promise<IPrescription | null> {
    return await this.prescriptionRepository.findByAppointmentId(appointmentId);
  }

  async updatePrescription(appointmentId: string, updateData: Partial<IPrescription>): Promise<IPrescription | null> {
    return await this.prescriptionRepository.updateByAppointmentId(appointmentId, updateData);
  }

  async generatePdfContent(prescription: IPrescription): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const appointment = await this.appointmentService.getAppointmentById(prescription.appointmentId.toString());
        if (!appointment) {
          throw new Error("Appointment not found");
        }

        const doctor = await this.doctorService.getDoctorById(appointment.doctorId.toString());
        const patient = await this.userService.getUserById(appointment.patientId.toString());

        if (!doctor || !patient) {
          throw new Error("Doctor or Patient information not found");
        }

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.font('Helvetica-Bold')
          .fontSize(24)
          .text('Medical Prescription', { align: 'center' })
          .moveDown(0.5);

        // Doctor Details
        doc.font('Helvetica-Bold')
          .fontSize(14)
          .text('Prescribed By:', { underline: true });
        doc.font('Helvetica')
          .fontSize(12)
          .text(`Dr. ${doctor.name}`)
          .text(`Specialization: ${doctor.speciality}`)
          .moveDown();

        // Patient Details
        doc.font('Helvetica-Bold')
          .fontSize(14)
          .text('Patient:', { underline: true });
        doc.font('Helvetica')
          .fontSize(12)
          .text(patient.name)
          .moveDown();

        // Prescription Details
        doc.font('Helvetica-Bold')
          .fontSize(14)
          .text('Diagnosis:', { underline: true });
        doc.font('Helvetica')
          .fontSize(12)
          .text(prescription.diagnosis)
          .moveDown();

        // Medicines
        doc.font('Helvetica-Bold')
          .fontSize(14)
          .text('Prescribed Medicines:', { underline: true });

        prescription.medicines.forEach((medicine, index) => {
          doc.font('Helvetica-Bold')
            .fontSize(12)
            .text(`${index + 1}. ${medicine.name}`);
          
          doc.font('Helvetica')
            .fontSize(10)
            .text(`   Dosage: ${medicine.dosage}`)
            .text(`   Duration: ${medicine.duration}`)
            .text(`   Timing: ${medicine.timing}`)
            .text(`   Instructions: ${medicine.instructions || 'No special instructions'}`)
            .moveDown(0.5);
        });

        // Additional Notes
        if (prescription.notes) {
          doc.font('Helvetica-Bold')
            .fontSize(14)
            .text('Additional Notes:', { underline: true });
          
          doc.font('Helvetica')
            .fontSize(12)
            .text(prescription.notes)
            .moveDown();
        }

        // Footer
        doc.fontSize(8)
          .text(`Prescription Generated: ${new Date().toLocaleString()}`);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}