import { Request, Response } from 'express';
import Prescription from '../models/prescription.model';
import PDFDocument = require('pdfkit');
import { Types } from 'mongoose';
import Appointment from "../models/appointment"
import notificationService from '../services/notificationService';

export const createPrescription = async (req: Request, res: Response) => {
  try {
    const { appointmentId, medicines, diagnosis, notes } = req.body;

    // Validate appointmentId
    if (!Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    // Fetch appointment details to get userId
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const userId = appointment.patientId.toString(); // Ensure userId is a string

    // Check if a prescription already exists for this appointment
    let prescription = await Prescription.findOne({ appointmentId });

    if (prescription) {
      // Update existing prescription
      prescription.medicines = medicines;
      prescription.diagnosis = diagnosis;
      prescription.notes = notes;
      await prescription.save();

      // Notification for prescription update
      const notification = await notificationService.createNotification({
        recipientId: userId || '',
        recipientRole: "user",
        message: `Your prescription for appointment on ${appointment.date} at ${appointment.time} has been updated.`,
      });

      (req as any).io.to(userId).emit("newNotification", notification);

      return res.status(200).json({
        success: true,
        message: "Prescription updated successfully",
        data: prescription,
      });
    } else {
      // Create new prescription
      prescription = new Prescription({
        appointmentId,
        medicines,
        diagnosis,
        notes,
      });

      await prescription.save();

      // Notification for new prescription
      const notification = await notificationService.createNotification({
        recipientId: userId || '',
        recipientRole: "user",
        message: `Your prescription for appointment on ${appointment.date} at ${appointment.time} has been created.`,
      });

      (req as any).io.to(userId).emit("newNotification", notification);

      return res.status(201).json({
        success: true,
        message: "Prescription created successfully",
        data: prescription,
      });
    }
  } catch (error) {
    console.error("Error saving prescription:", error);
    res.status(500).json({
      message: "Failed to save prescription",
      error: error instanceof Error ? error.message : "An unknown error occurred",
    });
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