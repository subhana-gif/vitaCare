"use strict";
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
    async scheduleReminders(appointment) {
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
    }
    async scheduleReminder(appointment, reminderTime, timeframe) {
        const jobId = `${appointment._id}-${timeframe}`;
        const job = new cron_1.CronJob(reminderTime, async () => {
            try {
                // Fetch updated appointment with populated patient and doctor details
                const updatedAppointment = await appointment_1.default.findById(appointment._id)
                    .populate('patientId', 'name email')
                    .populate('doctorId', 'name address')
                    .select('date time appointmentFee') // Ensure appointmentFee is fetched
                    .lean();
                if (!updatedAppointment || updatedAppointment.status === 'cancelled') {
                    this.jobs.get(jobId)?.stop();
                    this.jobs.delete(jobId);
                    return;
                }
                const patient = updatedAppointment.patientId;
                const doctor = updatedAppointment.doctorId;
                await emailService_1.default.sendAppointmentReminderEmail(patient.email, {
                    patientName: patient.name,
                    doctorName: doctor.name,
                    date: updatedAppointment.date,
                    time: updatedAppointment.time,
                    location: doctor.address,
                    timeframe: timeframe
                });
                // Clean up after sending
                this.jobs.get(jobId)?.stop();
                this.jobs.delete(jobId);
            }
            catch (error) {
                console.error(`Failed to send reminder email for appointment ${appointment._id}:`, error);
            }
        });
        job.start();
        this.jobs.set(jobId, job);
    }
    async cancelReminders(appointmentId) {
        const reminderTypes = ['24 hours', '30 minutes'];
        for (const timeframe of reminderTypes) {
            const jobId = `${appointmentId}-${timeframe}`;
            this.jobs.get(jobId)?.stop();
            this.jobs.delete(jobId);
        }
    }
}
exports.default = new AppointmentReminderService();
