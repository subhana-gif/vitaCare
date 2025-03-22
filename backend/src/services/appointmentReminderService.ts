import { CronJob } from 'cron';
import EmailService from './emailService';
import Appointment from '../models/appointment';
import {subHours, subMinutes } from 'date-fns';
    
class AppointmentReminderService {
  private readonly jobs: Map<string, CronJob> = new Map();

  async scheduleReminders(appointment: any) {
    const appointmentDate = new Date(appointment.date);
    const appointmentTime = appointment.time;
    const [hours, minutes] = appointmentTime.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));

    // Schedule 24-hour reminder
    const twentyFourHourReminder = subHours(appointmentDate, 24);
    if (twentyFourHourReminder > new Date()) {
      this.scheduleReminder(appointment, twentyFourHourReminder, '24 hours');
    }

    // Schedule 30-minute reminder
    const thirtyMinReminder = subMinutes(appointmentDate, 30);
    if (thirtyMinReminder > new Date()) {
      this.scheduleReminder(appointment, thirtyMinReminder, '30 minutes');
    }
  }

  private async scheduleReminder(appointment: any, reminderTime: Date, timeframe: string) {
    const jobId = `${appointment._id}-${timeframe}`;
    
    const job = new CronJob(reminderTime, async () => {
      try {
        // Fetch updated appointment with populated patient and doctor details
        const updatedAppointment = await Appointment.findById(appointment._id)
        .populate('patientId', 'name email')
        .populate('doctorId', 'name address')
        .select('date time appointmentFee') // Ensure appointmentFee is fetched
        .lean();

        if (!updatedAppointment || updatedAppointment.status === 'cancelled') {
          this.jobs.get(jobId)?.stop();
          this.jobs.delete(jobId);
          return;
        }

        const patient = updatedAppointment.patientId as any;
        const doctor = updatedAppointment.doctorId as any;

        await EmailService.sendAppointmentReminderEmail(
          patient.email,
          {
            patientName: patient.name,
            doctorName: doctor.name,
            date: updatedAppointment.date,
            time: updatedAppointment.time,
            location: doctor.address,
            timeframe: timeframe
          }
        );

        // Clean up after sending
        this.jobs.get(jobId)?.stop();
        this.jobs.delete(jobId);
      } catch (error) {
        console.error(`Failed to send reminder email for appointment ${appointment._id}:`, error);
      }
    });

    job.start();
    this.jobs.set(jobId, job);
  }

  async cancelReminders(appointmentId: string) {
    const reminderTypes = ['24 hours', '30 minutes'];
    for (const timeframe of reminderTypes) {
      const jobId = `${appointmentId}-${timeframe}`;
      this.jobs.get(jobId)?.stop();
      this.jobs.delete(jobId);
    }
  }
}

export default new AppointmentReminderService();