import { IDoctor } from "../models/doctors";
import { IDoctorRepository } from "../repositories/IDoctorRepository";
import { IDoctorService } from "../services/IDoctorService";
import EmailService from "./emailService";
import TokenService from "./tokenService";
import bcrypt from "bcrypt";

export class DoctorService implements IDoctorService {
  constructor(private repository: IDoctorRepository) {}

  async registerDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    doctorData.status = "pending";
    return this.repository.create(doctorData);
  }

  async loginDoctor(
    email: string,
    password: string
  ): Promise<{ doctor: IDoctor; token: string } | null> {
    const doctor = await this.repository.findByEmail(email);
    if (!doctor || !doctor.password) return null;

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) return null;

    if (doctor.isBlocked) throw new Error("Your account has been blocked");

    const token = TokenService.generateToken({
      id: doctor._id,
      email: doctor.email,
      role: "doctor",
    });

    return { doctor, token };
  }

  async getAllDoctors(): Promise<IDoctor[]> {
    return this.repository.findAll();
  }

  async getDoctorById(id: string): Promise<IDoctor | null> {
    return this.repository.findById(id);
  }

  async addDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    doctorData.status = "approved";
    const doctor = await this.repository.create(doctorData);

    const resetToken = TokenService.generateToken(
      { id: doctor._id, email: doctor.email },
      "24h"
    );
    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/doctors/set-password/${resetToken}`;
    await EmailService.sendPasswordResetEmail(doctor.email, resetLink);

    return doctor;
  }

  async updateDoctor(
    id: string,
    updateData: Partial<IDoctor>
  ): Promise<IDoctor | null> {
    return this.repository.update(id, updateData);
  }

  async deleteDoctor(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async approveDoctor(
    doctorId: string,
    status: "approved" | "rejected"
  ): Promise<IDoctor | null> {
    return this.repository.updateStatus(doctorId, status);
  }

  async sendResetLink(email: string): Promise<void> {
    const doctor = await this.repository.findByEmail(email);
    if (!doctor) throw new Error("Doctor not found");

    const resetToken = TokenService.generateToken(
      { doctorId: doctor._id.toString(), email, role: "doctor" },
      "1h"
    );
    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/doctor/resetPassword/${resetToken}`;
    await EmailService.sendPasswordResetEmail(email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = TokenService.verifyToken(token) as unknown as { doctorId: string };
    if (!decoded?.doctorId) throw new Error("Invalid token");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.repository.update(decoded.doctorId, { password: hashedPassword });
  }

  async setPassword(token: string, password: string): Promise<void> {
    const decoded = TokenService.verifyToken(token) as { id: string };
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.repository.update(decoded.id, { password: hashedPassword });
  }
}