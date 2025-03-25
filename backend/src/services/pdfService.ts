// src/services/pdf.service.ts
import PDFDocument from 'pdfkit';
import { IPrescription } from '../interfaces/IPriscription';
import {IDoctor} from '../models/doctors';
import {IUser} from '../interfaces/IUser';

export class PdfService {
  static async generatePrescriptionPdf(
    prescription: IPrescription,
    doctor: IDoctor,
    patient: IUser
  ): Promise<typeof PDFDocument> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Prescription Header
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
      .text(`${patient.name}`)
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
    const footerText = `Prescription Generated: ${new Date().toLocaleString()}`;
    doc.fontSize(8)
      .text(footerText, { align: 'left' });

    return doc;
  }
}