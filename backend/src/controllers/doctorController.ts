import { Request, Response } from "express";
import { IDoctorService } from "../interfaces/doctor/IDoctorService";
import { uploadFileToS3 } from "../middleware/uploadMiddleware";
import Speciality from "../models/speciality";
import notificationService from "../services/notificationService";
import { HttpMessage, HttpStatus } from "../enums/HttpStatus";

export class DoctorController {
  constructor(private doctorService: IDoctorService) {}

  private handleError(res: Response, error: unknown, defaultMessage: string): void {
    const message = error instanceof Error ? error.message : defaultMessage;
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message });
  }

  async registerDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const doctor = await this.doctorService.registerDoctor({ name, email, password });
  
      // Create the notification and get the result
      const notification = await notificationService.createNotification({
        recipientId: doctor._id?.toString() || "",
        recipientRole: "admin",
        message: `New doctor ${doctor.name} signed up!`,
      });
  
      // Emit the notification to the admin room
      req.io?.to("adminRoom").emit("newNotification", {
        message: notification.message,
        createdAt: notification.createdAt || new Date(), // Use current date if not provided
        seen: false, // Default to false if not provided
      });
  
      res.status(HttpStatus.CREATED).json({ message: HttpMessage.OK });
    } catch (error) {
      this.handleError(res, error, "Error registering doctor");
    }
  }
  async loginDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.doctorService.loginDoctor(email, password);

      if (!result) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: HttpMessage.UNAUTHORIZED });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: "Login successful",
        doctor: {
          _id: result.doctor._id,
          name: result.doctor.name,
          email: result.doctor.email,
          status: result.doctor.status,
        },
        token: result.token,
      });
    } catch (error) {
      this.handleError(res, error, "Error logging in");
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await this.doctorService.sendResetLink(email);
      res.status(HttpStatus.OK).json({ message: HttpMessage.OK });
    } catch (error) {
      this.handleError(res, error, "Error sending reset link");
    }
  }

  async getAllDoctors(req: Request, res: Response): Promise<void> {
    try {
      const doctors = await this.doctorService.getAllDoctors();
      res.json({ doctors });
    } catch (error) {
      this.handleError(res, error, "Error fetching doctors");
    }
  }

  async getDoctorById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id || req.query.doctorId;
      if (!id) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
        return;
      }

      const doctor = await this.doctorService.getDoctorById(id.toString());
      if (!doctor) {
        res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
        return;
      }

      res.status(HttpStatus.OK).json({ doctor });
    } catch (error) {
      this.handleError(res, error, "Error fetching doctor");
    }
  }

  async addDoctor(req: Request, res: Response): Promise<void> {
    try {
      const doctorData = req.body;
      const speciality = await Speciality.findOne({ name: doctorData.speciality });
      if (!speciality) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
        return;
      }

      if (req.file) {
        const uploadedFile = await uploadFileToS3(req.file);
        doctorData.imageUrl = uploadedFile.fileUrl;
      }

      const doctor = await this.doctorService.addDoctor(doctorData);
      res.status(HttpStatus.CREATED).json({
        message: "Doctor added successfully",
        doctor,
      });
    } catch (error) {
      this.handleError(res, error, "Error adding doctor");
    }
  }

  async updateDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (req.file) {
        const uploadedFile = await uploadFileToS3(req.file);
        updateData.imageUrl = uploadedFile.fileUrl;
      }

      if (updateData.speciality) {
        const speciality = await Speciality.findOne({ name: updateData.speciality });
        if (!speciality) {
          res.status(HttpStatus.BAD_REQUEST).json({ message:HttpMessage.BAD_REQUEST });
          return;
        }
        updateData.speciality = speciality.name;
      }

      const doctor = await this.doctorService.updateDoctor(id, updateData);
      if (!doctor) {
        res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
        return;
      }

      res.status(HttpStatus.OK).json({ message: HttpMessage.OK });
    } catch (error) {
      this.handleError(res, error, "Error updating doctor");
    }
  }


  async getDoctorProfile(req: Request, res: Response): Promise<void> {
    try {
      // Get doctor ID from the token (more secure than query params)
      const doctorId = req.user?.id;
      
      if (!doctorId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
        return;
      }
  
      const doctor = await this.doctorService.getDoctorById(doctorId);
      if (!doctor) {
        res.status(HttpStatus.NOT_FOUND).json({ message:HttpMessage.NOT_FOUND });
        return;
      }
  
      const doctorProfile = {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        speciality: doctor.speciality,
        degree: doctor.degree,
        experience: doctor.experience,
        address: doctor.address,
        about: doctor.about,
        imageUrl: doctor.imageUrl,
        available: doctor.available,
        status: doctor.status,
      };
  
      res.status(HttpStatus.OK).json(doctorProfile); 
    } catch (error) {
      this.handleError(res, error, "Error fetching doctor profile");
    }
  }

  async deleteDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.doctorService.deleteDoctor(id);
      res.status(HttpStatus.OK).json({ message: HttpMessage.OK });
    } catch (error) {
      this.handleError(res, error, "Error deleting doctor");
    }
  }

  async approveDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, status } = req.body;
      const doctor = await this.doctorService.approveDoctor(doctorId, status);
      if (!doctor) {
        res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
        return;
      }

      res.status(HttpStatus.OK).json({ message: `Doctor ${status}`, doctor });
    } catch (error) {
      this.handleError(res, error, "Error approving doctor");
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await this.doctorService.resetPassword(token, newPassword);
      res.status(HttpStatus.OK).json({ message: HttpMessage.OK });
    } catch (error) {
      this.handleError(res, error, "Error resetting password");
    }
  }

  async setPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      console.log("token for setpassword:",token)
      await this.doctorService.setPassword(token, password);
      res.status(HttpStatus.OK).json({ message: HttpMessage.OK});
    } catch (error) {
      console.log("error setting password:",error)
      this.handleError(res, error, "Error setting password");
    }
  }
}