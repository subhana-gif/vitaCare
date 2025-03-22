import { Request, Response } from "express";
import { DoctorService } from "../services/DoctorService";
import { IDoctor } from "../models/doctors";
import { uploadFileToS3 } from "../middleware/uploadMiddleware";
import Speciality from "../models/speciality";

export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
  ) {}

  async registerDoctor(req: Request, res: Response): Promise<void> {
    try {
        const { name, email, password } = req.body;

        const doctorData: Partial<IDoctor> = {
            name,
            email,
            password,
            status: "pending"
        };

        const doctor = await this.doctorService.registerDoctor(doctorData);

        res.status(201).json({
            message: "Doctor registered successfully. Please log in.",
            doctor
        });
    } catch (error) {
        res.status(500).json({
            message: "Error registering doctor",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
  }


  async loginDoctor(req: Request, res: Response): Promise<void> {
  try {
      const { email, password } = req.body;
      const result = await this.doctorService.loginDoctor(email, password);

      if (!result) {
          res.status(401).json({ message: "Invalid credentials" });
          return;
      }

      res.status(200).json({
        message: "Login successful",
        doctor: {
          _id: result.doctor._id,
          name: result.doctor.name,
          email: result.doctor.email,
          status: result.doctor.status, // ✅ Ensure this is included
        },
        token: result.token,
      });
  } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
  }
  }

  async getAllDoctors(req: Request, res: Response): Promise<void> {
    try {
   
      const doctors = await this.doctorService.getAllDoctors();
      res.json({ doctors });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  async getDoctorById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.query.doctorId as string;
      if (!id) {
        res.status(400).json({ message: "Doctor ID is required" });
        return;
      }

      const doctor = await this.doctorService.getDoctorById(id);
      doctor ? res.status(200).json({ data: doctor }) : res.status(404).json({ message: "Doctor not found" });
    } catch (error) {
      res.status(500).json({ message: "Error fetching doctor", error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  async getDoctorsById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id || id.length !== 24) {
            res.status(400).json({ message: "Invalid doctor ID format" });
            return;
        }

        const doctor = await this.doctorService.getDoctorById(id);

        if (!doctor) {
            res.status(404).json({ message: "Doctor not found" });
            return;
        }

        res.status(200).json({ doctor });
    } catch (error) {
        console.error("Error fetching doctor details:", error);
        res.status(500).json({ message: "Failed to fetch doctor details", error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  async updateDoctor(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updateData: Partial<IDoctor> = req.body;

        // 🔹 Handle image upload
        if (req.file) {
            const uploadedFile = await uploadFileToS3(req.file);
            updateData.imageUrl = uploadedFile.fileUrl;
        }

        // 🔹 Handle speciality conversion
        if (updateData.speciality) {
            const speciality = await Speciality.findOne({ name: updateData.speciality });
            if (!speciality) {
                res.status(400).json({ message: "Invalid speciality provided" });
                return;
            }
            updateData.speciality = speciality.name;   
          }

        const doctor = await this.doctorService.updateDoctor(id, updateData);

        if (doctor) {
            res.status(200).json({ message: "Doctor updated successfully", doctor });
        } else {
            res.status(404).json({ message: "Doctor not found" });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error updating doctor",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}

  async deleteDoctor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.doctorService.deleteDoctor(id);
      res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting doctor", error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  async approveDoctor(req: Request, res: Response): Promise<void> {
    try {
        const { doctorId, status } = req.body;
        const updatedDoctor = await this.doctorService.updateDoctorStatus(doctorId, status);

        if (!updatedDoctor) {
            res.status(404).json({ message: "Doctor not found" });
            return;
        }

        res.status(200).json({
            message: `Doctor status updated to ${status}`,
            doctor: updatedDoctor // ✅ Return updated doctor details
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error approving/rejecting doctor", 
            error: error instanceof Error ? error.message : "Unknown error" 
        });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
  try {
      const { email } = req.body;
      await this.doctorService.sendResetLink(email);
      res.status(200).json({ message: "Password reset link sent successfully." });
  } catch (error) {
      res.status(500).json({ error: "Failed to send password reset link." });
  }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    console.log("hit")
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    try {
      await this.doctorService.resetPassword(token, newPassword);
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.log("error reset password:",error)
      res.status(500).json({ error: "Failed to reset password" });
    }
  }

  async addDoctor(req: Request, res: Response): Promise<void> {
    try {
        const doctorData: Partial<IDoctor> = req.body;
        const speciality = await Speciality.findOne({ name: doctorData.speciality });
        if (!speciality) {
           res.status(400).json({ message: "Speciality not found." });
           return 
        }
        doctorData.speciality = speciality.name;  // ✅ Correct Type Assignment

        if (req.file) {
            const uploadedFile = await uploadFileToS3(req.file);
            doctorData.imageUrl = uploadedFile.fileUrl;
        }

        const doctor = await this.doctorService.addDoctor(doctorData);

        res.status(201).json({
            message: "Doctor added successfully. Password setup email has been sent.",
            doctor
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding doctor",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
  }

  async setPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({ message: "Token and password are required" });
        return;
      }

      await this.doctorService.setPassword(token, password);
      res.status(200).json({ message: "Password set successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Error setting password",
        error: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  }
}
