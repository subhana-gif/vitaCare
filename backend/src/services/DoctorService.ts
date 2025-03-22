import { IDoctor } from "../models/doctors";
import { DoctorRepository } from "../repositories/doctorRepository";
import EmailService from "./emailService";
import TokenService from "./tokenService";
import bcrypt from "bcrypt";

export class DoctorService {
  constructor(
    private doctorRepository: DoctorRepository,
    ) { }

    async registerDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
      doctorData.status = "pending";
  
      const doctor = await this.doctorRepository.createDoctor(doctorData);  
      return doctor;
  }
  
async loginDoctor(email: string, password: string): Promise<{ doctor: IDoctor; token: string } | null> {
  const result = await this.doctorRepository.loginDoctor(email, password);

  if (!result) return null;

  const { doctor } = result;
  if (doctor.isBlocked) throw new Error("Your account has been blocked. Please contact support.");
  return result;
}

  async getAllDoctors() {
    return await this.doctorRepository.findAll();
  }

  async getDoctorById(id: string): Promise<IDoctor | null> {
    return await this.doctorRepository.findDoctorById(id);
  }

  async updateDoctor(id: string, updateData: Partial<IDoctor>): Promise<IDoctor | null> {
    return await this.doctorRepository.updateDoctor(id, updateData);
  }

  async deleteDoctor(id: string): Promise<void> {
    await this.doctorRepository.deleteDoctor(id);
  }

  async updateDoctorStatus(doctorId: string, status: "approved" | "rejected"): Promise<IDoctor | null> {
    const updatedDoctor = await this.doctorRepository.updateDoctor(doctorId, { status });

    if (!updatedDoctor) throw new Error("Doctor not found");
    return updatedDoctor;
}

async addDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
  doctorData.status = "approved";
  const doctor = await this.doctorRepository.createDoctor(doctorData);

  const resetToken = TokenService.generateToken({ id: doctor._id ,email: doctor.email}, "24h");
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/doctors/set-password/${resetToken}`;
  await EmailService.sendPasswordResetEmail(doctor.email, resetLink);

  return doctor;
}

  async setPassword(token: string, password: string): Promise<void> {
    const decoded = TokenService.verifyToken(token) as unknown as { id: string;email:string };
    const doctor = await this.doctorRepository.findDoctorById(decoded.id);
    if (!doctor) throw new Error("Invalid token or doctor not found");

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.doctorRepository.updateDoctor(doctor._id.toString(), {
      password: hashedPassword,
      resetToken: undefined,
    });
  }

  async sendResetLink(email: string): Promise<void> {
    const doctor = await this.doctorRepository.findDoctorByEmail(email);
    if (!doctor) throw new Error("Doctor not found");

    const resetToken = TokenService.generateToken({ doctorId: doctor._id.toString(),email }, "30m");

    await this.doctorRepository.updateDoctor(doctor._id.toString(), {
        resetToken,
        resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000),
    });

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/doctor/resetPassword/${resetToken}`;
    await EmailService.sendPasswordResetEmail(email, resetLink);
}

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = TokenService.verifyToken(token) as unknown as { doctorId: string };
    const doctor = await this.doctorRepository.findDoctorById(decoded.doctorId);
    if (!doctor || doctor.resetToken !== token) throw new Error("Invalid or expired token");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.doctorRepository.updateDoctor(doctor._id.toString(), {
      password: hashedPassword,
      resetToken: undefined,
    });
  }
}
