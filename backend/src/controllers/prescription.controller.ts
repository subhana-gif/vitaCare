import { Request, Response } from 'express';
import Prescription from '../models/prescription.model';
import PDFDocument = require('pdfkit');
import { Types } from 'mongoose';

export const createPrescription = async (req: Request, res: Response) => {
  try {
    const { appointmentId, medicines, diagnosis, notes } = req.body;

    if (!Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const prescription = new Prescription({
      appointmentId,
      medicines,
      diagnosis,
      notes
    });

    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Failed to create prescription' });
  }
};

export const getPrescriptionByAppointment = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;

    if (!Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const prescription = await Prescription.findOne({ appointmentId });
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ message: 'Failed to fetch prescription' });
  }
};

export const downloadPrescription = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;

    if (!Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const prescription = await Prescription.findOne({ appointmentId });
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${appointmentId}.pdf`);

    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('Prescription', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('Diagnosis:', { underline: true });
    doc.fontSize(12).text(prescription.diagnosis);
    doc.moveDown();

    doc.fontSize(14).text('Medicines:', { underline: true });
    prescription.medicines.forEach((medicine, index) => {
      doc.fontSize(12).text(`${index + 1}. ${medicine.name}`);
      doc.fontSize(10)
        .text(`   Dosage: ${medicine.dosage}`)
        .text(`   Duration: ${medicine.duration}`)
        .text(`   Timing: ${medicine.timing}`);
      doc.moveDown(0.5);
    });

    if (prescription.notes) {
      doc.moveDown();
      doc.fontSize(14).text('Additional Notes:', { underline: true });
      doc.fontSize(12).text(prescription.notes);
    }

    doc.end();
  } catch (error) {
    console.error('Error generating prescription PDF:', error);
    res.status(500).json({ message: 'Failed to generate prescription PDF' });
  }
};