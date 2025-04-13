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
const cron_1 = require("cron");
const emailService_1 = __importDefault(require("./emailService"));
const appointment_1 = __importDefault(require("../models/appointment"));
const date_fns_1 = require("date-fns");
class AppointmentReminderService {
    constructor() {
        this.jobs = new Map();
    }
    scheduleReminders(appointment) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentDate = new Date(appointment.date);
            const appointmentTime = appointment.time;
            const [hours, minutes] = appointmentTime.split(':');
            appointmentDate.setHours(parseInt(hours), parseInt(minutes));
            // Schedule 24-hour reminder
            const twentyFourHourReminder = (0, date_fns_1.subHours)(appointmentDate, 24);
            if (twentyFourHourReminder > new Date()) {
                this.scheduleReminder(appointment, twentyFourHourReminder, '24 hours');
            }
            // Schedule 30-minute reminder
            const thirtyMinReminder = (0, date_fns_1.subMinutes)(appointmentDate, 30);
            if (thirtyMinReminder > new Date()) {
                this.scheduleReminder(appointment, thirtyMinReminder, '30 minutes');
            }
        });
    }
    scheduleReminder(appointment, reminderTime, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobId = `${appointment._id}-${timeframe}`;
            const job = new cron_1.CronJob(reminderTime, () => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                try {
                    // Fetch updated appointment with populated patient and doctor details
                    const updatedAppointment = yield appointment_1.default.findById(appointment._id)
                        .populate('patientId', 'name email')
                        .populate('doctorId', 'name address')
                        .select('date time appointmentFee') // Ensure appointmentFee is fetched
                        .lean();
                    if (!updatedAppointment || updatedAppointment.status === 'cancelled') {
                        (_a = this.jobs.get(jobId)) === null || _a === void 0 ? void 0 : _a.stop();
                        this.jobs.delete(jobId);
                        return;
                    }
                    const patient = updatedAppointment.patientId;
                    const doctor = updatedAppointment.doctorId;
                    yield emailService_1.default.sendAppointmentReminderEmail(patient.email, {
                        patientName: patient.name,
                        doctorName: doctor.name,
                        date: updatedAppointment.date,
                        time: updatedAppointment.time,
                        location: doctor.address,
                        timeframe: timeframe,
                        appointmentFee: 0
                    });
                    // Clean up after sending
                    (_b = this.jobs.get(jobId)) === null || _b === void 0 ? void 0 : _b.stop();
                    this.jobs.delete(jobId);
                }
                catch (error) {
                    console.error(`Failed to send reminder email for appointment ${appointment._id}:`, error);
                }
            }));
            job.start();
            this.jobs.set(jobId, job);
        });
    }
    cancelReminders(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const reminderTypes = ['24 hours', '30 minutes'];
            for (const timeframe of reminderTypes) {
                const jobId = `${appointmentId}-${timeframe}`;
                (_a = this.jobs.get(jobId)) === null || _a === void 0 ? void 0 : _a.stop();
                this.jobs.delete(jobId);
            }
        });
    }
}
exports.default = new AppointmentReminderService();
