"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
// src/services/pdf.service.ts
const pdfkit_1 = __importDefault(require("pdfkit"));
class PdfService {
    static async generatePrescriptionPdf(prescription, doctor, patient) {
        const doc = new pdfkit_1.default({
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
exports.PdfService = PdfService;
