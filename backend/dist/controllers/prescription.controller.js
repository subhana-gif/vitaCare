"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const priscriptionService_1 = require("../services/priscriptionService");
const mongoose_1 = require("mongoose");
const appointmentService_1 = require("../services/appointmentService");
const notificationService_1 = __importDefault(require("../services/notificationService"));
const appointmentRepository_1 = require("../repositories/appointmentRepository");
const doctorRepository_1 = require("../repositories/doctorRepository");
const DoctorService_1 = require("../services/DoctorService");
class PrescriptionController {
    constructor(appointmentRepository, doctorRepository) {
        this.createPrescription = async (req, res) => {
            try {
                const { appointmentId, medicines, diagnosis, notes } = req.body;
                if (!mongoose_1.Types.ObjectId.isValid(appointmentId)) {
                    res.status(400).json({ message: "Invalid appointment ID" });
                    return;
                }
                const prescription = await this.prescriptionService.createPrescription({
                    appointmentId: new mongoose_1.Types.ObjectId(appointmentId),
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
                    req.io.to(appointment.patientId.toString()).emit("newNotification", notification);
                }
                res.status(201).json({
                    success: true,
                    message: "Prescription processed successfully",
                    data: prescription,
                });
            }
            catch (error) {
                console.error("Error processing prescription:", error);
                res.status(500).json({
                    message: error.message || "Failed to process prescription",
                });
            }
        };
        this.getPrescriptionByAppointment = async (req, res) => {
            try {
                const { appointmentId } = req.params;
                const prescription = await this.prescriptionService.getPrescriptionByAppointment(appointmentId);
                if (!prescription) {
                    res.status(404).json({ message: 'Prescription not found' });
                    return;
                }
                res.json(prescription);
            }
            catch (error) {
                console.error('Error fetching prescription:', error);
                res.status(500).json({
                    message: error.message || 'Failed to fetch prescription'
                });
            }
        };
        this.downloadPrescription = async (req, res) => {
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
            }
            catch (error) {
                console.error('Error generating prescription PDF:', error);
                res.status(500).json({
                    message: error.message || 'Failed to generate prescription PDF'
                });
            }
        };
        this.prescriptionService = new priscriptionService_1.PrescriptionService();
        this.notificationService = notificationService_1.default;
        this.doctorService = new DoctorService_1.DoctorService(doctorRepository || new doctorRepository_1.DoctorRepository());
        this.appointmentService = new appointmentService_1.AppointmentService(appointmentRepository || new appointmentRepository_1.AppointmentRepository(), new DoctorService_1.DoctorService(doctorRepository || new doctorRepository_1.DoctorRepository()));
    }
}
exports.PrescriptionController = PrescriptionController;
