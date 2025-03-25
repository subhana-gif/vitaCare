import { Request, Response } from "express";
import { AppointmentService } from "../services/appointmentService";
import { DoctorService } from "../services/DoctorService";
import userService from "../services/userService";
import emailService from "../services/emailService";
import slotService from "../services/slotService";
import AppointmentReminderService from "../services/appointmentReminderService";
import notificationService from "../services/notificationService"; 
import schedule from "node-schedule";
import { sendCallReminder } from "../config/twilioCall";


const appointmentService = new AppointmentService();

export class AppointmentController {
    constructor(
      private readonly doctorService: DoctorService,
    ) {}
  
    async getAppointments(req: Request, res: Response): Promise<void> {
      try {
        const userId = req.user?.id; 
        if (!userId) {
          res.status(401).json({ message: "Unauthorized: User ID missing." });
          return;
        }
  
        const appointments = await appointmentService.getAppointmentsByUserId(userId);
        res.status(200).json(appointments);
      } catch (error: any) {
        res.status(500).json({
          message: error.message || "Failed to fetch appointments",
        });
      }
    }
  
  // ✅ Book Appointment
  async bookAppointment(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, doctorId, date, time } = req.body;
  
      if (!patientId || !doctorId || !date || !time) {
        res.status(400).json({ message: "All fields are required." });
        return;
      }
  
      const slot = await slotService.getSlotByDetails(doctorId, date, time);
      if (!slot) {
          res.status(404).json({ message: "Slot not found or unavailable." });
          return;
      }

      const appointmentFee = slot.price;


      // Fetch doctor's information
      const doctor = await this.doctorService.getDoctorById(doctorId);
      if (!doctor) {
        res.status(404).json({ message: "Doctor not found." });
        return;
      }
  
  
      // Fetch patient's information to get email
      const patient = await userService.getUserProfile(patientId);
      if (!patient) {
        res.status(404).json({ message: "Patient not found." });
        return;
      }
  
      // Book the appointment
      const appointment = await appointmentService.bookAppointment({
        patientId,
        doctorId,
        date,
        time,
        appointmentFee,
      });
      await emailService.sendAppointmentConfirmationEmail(
        patient.email,
        {
          patientName: `${patient.name}`,
          doctorName: `${doctor.name}`,
          date,
          time,
          appointmentFee,
          location: doctor.address 
        }
      ); // Added closing parenthesis and semicolon here
      
      // Schedule reminder emails
      await AppointmentReminderService.scheduleReminders(appointment);

      const appointmentDateTime = new Date(`${date}T${time}`);
      const reminderTime = new Date(appointmentDateTime.getTime() - 30 * 60000);
  
      if (!patient.phone) {
        console.error(`❌ Error: Patient ${patient.name} does not have a phone number.`);
      } else {
        schedule.scheduleJob(reminderTime, () => {
          return sendCallReminder(
            patient.phone as string, // ✅ TypeScript safe
            `Hello ${patient.name}, this is a reminder for your appointment with Doctor. ${doctor.name} at ${time}.`
          );
        });      
        console.log(`📞 Call reminder scheduled for: ${reminderTime}`);
      }

      const notification = await notificationService.createNotification({
        recipientId: doctorId,
        recipientRole: "doctor",
        message: `New appointment booked with ${patient.name} on ${date} at ${time}.`,
      });
  
      // ✅ Fix: Ensure `notification` exists before emitting
      (req as any).io.to(doctorId).emit("newNotification", notification);

      res.status(201).json({
        message: "Appointment booked successfully!",
        appointment,
      });
      // Send confirmation email to patient
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      res.status(500).json({
        message: error.message || "Failed to book appointment",
      });
    }
  }  

  // ✅ Update Appointment Status
  async updateStatus(req: Request, res: Response): Promise<void> {
    const { appointmentId } = req.params;
    const { status } = req.body;

    try {
      const updatedAppointment = await appointmentService.updateAppointmentStatus(appointmentId, status);
      const userId = updatedAppointment?.patientId.toString(); // Get the user's ID
    
      const notification = await notificationService.createNotification({
        recipientId: userId || '',
        recipientRole: "user",
        message: `Your appointment status has been changed to ${status}`,
      });
    
      if (userId && (req as any).io) {
        (req as any).io.to(userId).emit("newNotification", notification);
      }

      res.status(200).json({
        message: "Appointment updated successfully",
        updatedAppointment,
      });
    } catch (error: any) {
      console.error("Error updating appointment status:", error);
      res.status(error.message === "Appointment not found." ? 404 : 400).json({
        message: error.message || "Failed to update appointment status",
      });
    }
  }


  // ✅ Get Appointments for a Doctor
  async getDoctorAppointments(req: Request, res: Response): Promise<void> {
    const doctorId = req.user?.id as string;
  
    if (!doctorId) {
      res.status(400).json({ message: "Doctor ID missing in token" });
      return;
    }
  
    try {
      const appointments = await appointmentService.getAppointmentsByDoctor(doctorId);
      res.status(200).json({ appointments });
    } catch (error: any) {
      console.error("Appointment Fetch Error:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  }
  
  // ✅ Get Appointments for a Patient
  async getPatientAppointments(req: Request, res: Response): Promise<void> {
    const { patientId } = req.params;

    try {
      const appointments = await appointmentService.getAppointmentsByPatient(
        patientId
      );
      res.status(200).json({ appointments });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  }

  async cancelAppointment(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
        await appointmentService.cancelAppointment(id);
        res.status(200).json({ 
            message: "Appointment marked as cancelled successfully." 
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes("not found")) {
            res.status(404).json({ 
                message: "Failed to cancel appointment. Appointment not found." 
            });
        } else {
            res.status(500).json({ 
                message: error instanceof Error ? error.message : "Failed to cancel appointment." 
            });
        }
    }
}

async getAllAppointments(req: Request, res: Response): Promise<void> {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments." });
  }
}
}

