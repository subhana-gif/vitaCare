import { IDoctor } from "../../models/doctors";

export interface IDoctorRepository {
  create(doctorData: Partial<IDoctor>): Promise<IDoctor>;
  findByEmail(email: string): Promise<IDoctor | null>;
  findById(id: string): Promise<IDoctor | null>;
  findAll(): Promise<IDoctor[]>;
  update(id: string, updateData: Partial<IDoctor>): Promise<IDoctor | null>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: "pending" | "approved" | "rejected"): Promise<IDoctor | null>;
}