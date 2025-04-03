"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const DoctorService_1 = require("../services/DoctorService");
const doctorRepository_1 = require("../repositories/doctorRepository");
class AppointmentController {
    constructor(appointmentService, notificationService, doctorService = new DoctorService_1.DoctorService(new doctorRepository_1.DoctorRepository())) {
        this.appointmentService = appointmentService;
        this.notificationService = notificationService;
        this.doctorService = doctorService;
    }
    async bookAppointment(req, res) {
        try {
            const appointment = await this.appointmentService.bookAppointment(req.body);
            // Send notification to doctor
            const doctor = await this.doctorService.getDoctorById(appointment.doctorId.toString());
            if (doctor) {
                const notification = await this.notificationService.createNotification({
                    recipientId: appointment.doctorId.toString(),
                    recipientRole: "doctor",
                    message: `New appointment booked with you by ${req.user?.name || 'a patient'} on ${appointment.date} at ${appointment.time}`
                });
                req.io.to(appointment.doctorId.toString()).emit("newNotification", notification);
            }
            res.status(201).json({
                message: "Appointment booked successfully!",
                appointment
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            const { appointmentId } = req.params;
            const { status } = req.body;
            const updatedAppointment = await this.appointmentService.updateAppointmentStatus(appointmentId, status);
            res.status(200).json({
                message: "Appointment updated successfully",
                updatedAppointment
            });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async getDoctorAppointments(req, res) {
        try {
            const doctorId = req.user?.id;
            const appointments = await this.appointmentService.getAppointmentsByDoctor(doctorId);
            res.status(200).json({ appointments });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getPatientAppointments(req, res) {
        try {
            const { patientId } = req.params;
            const appointments = await this.appointmentService.getAppointmentsByPatient(patientId);
            res.status(200).json({ appointments });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async getAppointments(req, res) {
        try {
            const userId = req.user?.id;
            const appointments = await this.appointmentService.getAppointmentsByUserId(userId);
            res.status(200).json(appointments);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            await this.appointmentService.cancelAppointment(id);
            res.status(200).json({ message: "Appointment cancelled successfully" });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async getAllAppointments(req, res) {
        try {
            const appointments = await this.appointmentService.getAllAppointments();
            res.status(200).json({ appointments });
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.AppointmentController = AppointmentController;
