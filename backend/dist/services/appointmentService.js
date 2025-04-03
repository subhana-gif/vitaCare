"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const userService_1 = require("./userService");
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const emailService_1 = __importDefault(require("./emailService"));
const slotService_1 = __importDefault(require("./slotService"));
const appointmentReminderService_1 = __importDefault(require("./appointmentReminderService"));
const notificationService_1 = __importDefault(require("./notificationService"));
const twilioCall_1 = require("../config/twilioCall");
const node_schedule_1 = __importDefault(require("node-schedule"));
const logger_1 = __importDefault(require("../utils/logger"));
class AppointmentService {
    constructor(appointmentRepository, doctorService, userService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
        this.userService = userService || new userService_1.UserService(userRepository_1.default.getInstance());
    }
    async bookAppointment(appointmentData) {
        const { doctorId, date, time, patientId } = appointmentData;
        const slot = await slotService_1.default.getSlotByDetails(doctorId.toString(), date, time);
        if (!slot) {
            throw new Error("Slot not found or unavailable");
        }
        const existingAppointment = await this.appointmentRepository.findByDetails(doctorId.toString(), date, time);
        if (existingAppointment) {
            throw new Error("This slot is already booked");
        }
        const appointment = await this.appointmentRepository.create({
            ...appointmentData,
            appointmentFee: slot.price
        });
        await this.sendConfirmationAndReminders(appointment);
        return appointment;
    }
    async sendConfirmationAndReminders(appointment) {
        const [doctor, patient] = await Promise.all([
            this.doctorService.getDoctorById(appointment.doctorId.toString()),
            this.userService.getUserProfile(appointment.patientId.toString())
        ]);
        if (!doctor || !patient) {
            throw new Error("Doctor or patient not found");
        }
        // Send confirmation email
        await emailService_1.default.sendAppointmentConfirmationEmail(patient.email, {
            patientName: patient.name,
            doctorName: doctor.name,
            date: appointment.date,
            time: appointment.time,
            appointmentFee: appointment.appointmentFee,
            location: doctor.address
        });
        // Schedule reminders
        await appointmentReminderService_1.default.scheduleReminders(appointment);
        // Schedule call reminder
        if (patient.phone) {
            const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
            const reminderTime = new Date(appointmentDateTime.getTime() - 30 * 60000);
            node_schedule_1.default.scheduleJob(reminderTime, () => {
                (0, twilioCall_1.sendCallReminder)(patient.phone, `Hello ${patient.name}, this is a reminder for your appointment with doctor. ${doctor.name} at ${appointment.time}.`);
            });
        }
        // Send notification to doctor
        await notificationService_1.default.createNotification({
            recipientId: appointment.doctorId.toString(),
            recipientRole: "doctor",
            message: `New appointment booked with ${patient.name} on ${appointment.date} at ${appointment.time}.`,
        });
    }
    async getAppointmentsByUserId(userId) {
        logger_1.default.info(`Appointment get request for userid: ${userId}`);
        return this.appointmentRepository.getAppointmentsByPatient(userId);
    }
    async getAppointmentById(id) {
        return this.appointmentRepository.getById(id);
    }
    async updateAppointmentStatus(appointmentId, status) {
        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            throw new Error("Invalid status value");
        }
        const updateData = {
            status,
            ...(status === 'completed' && { paymentStatus: 'paid' })
        };
        const updatedAppointment = await this.appointmentRepository.update(appointmentId, updateData);
        if (!updatedAppointment) {
            throw new Error("Appointment not found");
        }
        await this.sendStatusUpdateNotification(updatedAppointment);
        return updatedAppointment;
    }
    async sendStatusUpdateNotification(appointment) {
        await notificationService_1.default.createNotification({
            recipientId: appointment.patientId.toString(),
            recipientRole: "user",
            message: `Your appointment status has been changed to ${appointment.status}`
        });
    }
    async getAppointmentsByDoctor(doctorId) {
        return this.appointmentRepository.getAppointmentsByDoctor(doctorId);
    }
    async getAppointmentsByPatient(patientId) {
        return this.appointmentRepository.getAppointmentsByPatient(patientId);
    }
    async cancelAppointment(appointmentId) {
        const appointment = await this.appointmentRepository.getById(appointmentId);
        if (!appointment) {
            throw new Error("Appointment not found");
        }
        if (appointment.status === 'cancelled') {
            throw new Error("Appointment is already cancelled");
        }
        await this.appointmentRepository.update(appointmentId, { status: 'cancelled' });
    }
    async getAllAppointments() {
        return this.appointmentRepository.getAllAppointments();
    }
}
exports.AppointmentService = AppointmentService;
