import { Request, Response } from 'express';
import Prescription from '../models/prescription.model';
import PDFDocument = require('pdfkit');
import { Types } from 'mongoose';
import Appointment from "../models/appointment"
import notificationService from '../services/notificationService';
import Doctor from '../models/doctors';
import User from '../models/user';

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
 
    // Find prescription and populate it differently
    const prescription = await Prescription.findOne({ appointmentId })
      .populate({
        path: 'appointmentId',
        populate: [
          { path: 'doctorId', model: 'Doctor' },
          { path: 'patientId', model: 'User' }
        ]
      });

    if (!prescription) { 
      return res.status(404).json({ message: 'Prescription not found' }); 
    } 

    // Safely access doctor and patient information
    const appointment = prescription.appointmentId as any;
    const doctor = await Doctor.findById(appointment.doctorId);
    const patient = await User.findById(appointment.patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ message: 'Doctor or Patient information not found' }); 
    }
 
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    }); 
    res.setHeader('Content-Type', 'application/pdf'); 
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${appointmentId}.pdf`); 
 
    doc.pipe(res); 

    // Track the starting Y position
    const startY = doc.y;
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;

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
    const textWidth = doc.widthOfString(footerText);
    
    // Move to bottom of page
    doc.fontSize(8)
       .text(footerText,
         { width: textWidth, align: 'left' });

    doc.end(); 
  } catch (error) { 
    console.error('Error generating prescription PDF:', error); 
    res.status(500).json({ message: 'Failed to generate prescription PDF' }); 
  } 
};