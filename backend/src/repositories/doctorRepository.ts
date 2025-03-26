import { IDoctor } from "../models/doctors";
import Doctor from "../models/doctors";
import { IDoctorRepository } from "../interfaces/doctor/IDoctorRepository";

export class DoctorRepository implements IDoctorRepository {
  async create(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
  }

  async findByEmail(email: string): Promise<IDoctor | null> {
    return Doctor.findOne({ email }).exec();
  }

  async findById(id: string): Promise<IDoctor | null> {
    return Doctor.findById(id).exec();
  }

  async findAll(): Promise<IDoctor[]> {
    return Doctor.find().exec();
  }

  async update(id: string, updateData: Partial<IDoctor>): Promise<IDoctor | null> {
    return Doctor.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    }).exec();
  }

  async delete(id: string): Promise<void> {
    await Doctor.findByIdAndDelete(id).exec();
  }

  async updateStatus(
    id: string,
    status: "pending" | "approved" | "rejected"
  ): Promise<IDoctor | null> {
    return this.update(id, { status });
  }
}