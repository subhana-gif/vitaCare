"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const dayjs_1 = __importDefault(require("dayjs"));
class AppointmentService {
    constructor(appointmentRepository, doctorService, userService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
        this.userService = userService || new userService_1.UserService(userRepository_1.default.getInstance());
    }
    bookAppointment(appointmentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doctorId, date, time, patientId, slotId } = appointmentData;
            // Fetch slot by ID
            const slot = yield slotService_1.default.getSlotById(slotId);
            if (!slot) {
                throw new Error("Slot not found");
            }
            if (slot.doctorId.toString() !== doctorId.toString()) {
                throw new Error("Slot doesn't belong to this doctor");
            }
            // Validate dayOfWeek matches date
            if (!date || typeof date !== "string") {
                throw new Error("Invalid date provided");
            }
            const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' });
            if (slot.dayOfWeek !== dayOfWeek) {
                throw new Error("Selected date doesn’t match slot’s day of week");
            }
            // Validate time is within slot range and on 15-minute interval
            if (!slot.startTime || !slot.endTime || !time) {
                throw new Error("Invalid time data in slot or request");
            }
            const startTime = (0, dayjs_1.default)(`2000-01-01 ${slot.startTime}`);
            const endTime = (0, dayjs_1.default)(`2000-01-01 ${slot.endTime}`);
            const selectedTime = (0, dayjs_1.default)(`2000-01-01 ${time}`);
            if (typeof startTime === 'undefined' || typeof endTime === 'undefined' || typeof selectedTime === 'undefined') {
                throw new Error("Invalid time format in slot or request");
            }
            if (selectedTime.isBefore(startTime) ||
                selectedTime.isAfter(endTime) ||
                selectedTime.diff(startTime, "minute") % 15 !== 0) {
                throw new Error("Selected time is outside slot range or not on 15-minute interval");
            }
            // Check for existing appointment
            const existingAppointment = yield this.appointmentRepository.findByDetails(doctorId.toString(), date, time);
            if (existingAppointment) {
                throw new Error("This slot is already booked");
            }
            // Create appointment
            const appointment = yield this.appointmentRepository.create(Object.assign(Object.assign({}, appointmentData), { appointmentFee: slot.price }));
            yield this.sendConfirmationAndReminders(appointment);
            return appointment;
        });
    }
    sendConfirmationAndReminders(appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            const [doctor, patient] = yield Promise.all([
                this.doctorService.getDoctorById(appointment.doctorId.toString()),
                this.userService.getUserProfile(appointment.patientId.toString())
            ]);
            if (!doctor || !patient) {
                throw new Error("Doctor or patient not found");
            }
            // Send confirmation email
            yield emailService_1.default.sendAppointmentConfirmationEmail(patient.email, {
                patientName: patient.name,
                doctorName: doctor.name,
                date: appointment.date,
                time: appointment.time,
                appointmentFee: appointment.appointmentFee,
                location: doctor.address
            });
            // Schedule reminders
            yield appointmentReminderService_1.default.scheduleReminders(appointment);
            // Schedule call reminder
            if (patient.phone) {
                const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
                const reminderTime = new Date(appointmentDateTime.getTime() - 30 * 60000);
                node_schedule_1.default.scheduleJob(reminderTime, () => {
                    (0, twilioCall_1.sendCallReminder)(patient.phone, `Hello ${patient.name}, this is a reminder for your appointment with doctor. ${doctor.name} at ${appointment.time}.`);
                });
            }
            // Send notification to doctor
            yield notificationService_1.default.createNotification({
                recipientId: appointment.doctorId.toString(),
                recipientRole: "doctor",
                message: `New appointment booked with ${patient.name} on ${appointment.date} at ${appointment.time}.`,
            });
        });
    }
    getAppointmentsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.appointmentRepository.getAppointmentsByPatient(userId);
        });
    }
    getAppointmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.appointmentRepository.getById(id);
        });
    }
    updateAppointmentStatus(appointmentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
                throw new Error("Invalid status value");
            }
            const updateData = Object.assign({ status }, (status === 'completed' && { paymentStatus: 'paid' }));
            const updatedAppointment = yield this.appointmentRepository.update(appointmentId, updateData);
            if (!updatedAppointment) {
                throw new Error("Appointment not found");
            }
            yield this.sendStatusUpdateNotification(updatedAppointment);
            return updatedAppointment;
        });
    }
    sendStatusUpdateNotification(appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            yield notificationService_1.default.createNotification({
                recipientId: appointment.patientId.toString(),
                recipientRole: "user",
                message: `Your appointment status has been changed to ${appointment.status}`
            });
        });
    }
    getAppointmentsByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.appointmentRepository.getAppointmentsByDoctor(doctorId);
        });
    }
    getAppointmentsByPatient(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.appointmentRepository.getAppointmentsByPatient(patientId);
        });
    }
    cancelAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.appointmentRepository.getById(appointmentId);
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            if (appointment.status === 'cancelled') {
                throw new Error("Appointment is already cancelled");
            }
            yield this.appointmentRepository.update(appointmentId, { status: 'cancelled' });
        });
    }
    getAllAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.appointmentRepository.getAllAppointments();
        });
    }
}
exports.AppointmentService = AppointmentService;
