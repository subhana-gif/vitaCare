import { IDoctor } from "../models/doctors";
import Doctor from "../models/doctors";
import bcrypt from "bcrypt";
import TokenService from "../services/tokenService";  // Import TokenService

export class DoctorRepository {
  

  async loginDoctor(email: string, password: string): Promise<{ doctor: IDoctor; token: string } | null> {
    try {
      const doctor = await this.findDoctorByEmail(email);
      if (!doctor) {
        throw new Error("Invalid credentials");
      }
  
      if (doctor.isBlocked) {
        throw new Error("Blocked account");
      }
  
      const isPasswordValid = await bcrypt.compare(password, doctor.password || '');
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }
  
      const token = TokenService.generateToken({
        id: doctor._id,
        email: doctor.email,
        role: "doctor"
      });
  
      return { doctor, token };
    } catch (error) {
      console.error("Error during doctor login:", error);
      throw new Error("Failed to login doctor. Please try again.");
    }
  }
  
  async createDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    try {
      const doctor = new Doctor(doctorData);
      return await doctor.save();
    } catch (error) {
      console.error("Error creating doctor:", error);
      throw new Error("Failed to create doctor. Please try again.");
    }
  }

  async findDoctorByEmail(email: string): Promise<IDoctor | null> {
    return await Doctor.findOne({ email }).exec();
  }

  async findDoctorById(id: string): Promise<IDoctor | null> {
    return await Doctor.findById(id).exec();
  }

  async updateDoctor(id: string, updateData: Partial<IDoctor>): Promise<IDoctor | null> {
    return await Doctor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      strict: true,
    }).exec();
  }

  async deleteDoctor(id: string): Promise<void> {
    await Doctor.findByIdAndDelete(id).exec();
  }

  async findAll(query: { page?: number; limit?: number } = {}): Promise<IDoctor[]> {
    const { page = 1, limit = 10 } = query;
    return await Doctor.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }
}
