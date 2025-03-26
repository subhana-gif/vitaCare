import { IDoctor } from "../../models/doctors";

export interface IDoctorService {
  registerDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor>;
  loginDoctor(email: string, password: string): Promise<{ doctor: IDoctor; token: string } | null>;
  getAllDoctors(): Promise<IDoctor[]>;
  getDoctorById(id: string): Promise<IDoctor | null>;
  addDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor>;
  updateDoctor(id: string, updateData: Partial<IDoctor>): Promise<IDoctor | null>;
  deleteDoctor(id: string): Promise<void>;
  approveDoctor(doctorId: string, status: "approved" | "rejected"): Promise<IDoctor | null>;
  sendResetLink(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  setPassword(token: string, password: string): Promise<void>;
}