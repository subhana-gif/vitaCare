"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorRepository = void 0;
const doctors_1 = __importDefault(require("../models/doctors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class DoctorRepository {
    async loginDoctor(email, password) {
        try {
            const doctor = await this.findDoctorByEmail(email);
            if (!doctor) {
                throw new Error("Invalid credentials");
            }
            if (doctor.isBlocked) {
                throw new Error("blocked");
            }
            const isPasswordValid = await bcrypt_1.default.compare(password, doctor.password || '');
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
            const token = jsonwebtoken_1.default.sign({ id: doctor._id, email: doctor.email, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return { doctor, token };
        }
        catch (error) {
            console.error("Error during doctor login:", error);
            throw new Error("Failed to login doctor. Please try again.");
        }
    }
    async createDoctor(doctorData) {
        try {
            const doctor = new doctors_1.default(doctorData);
            return await doctor.save();
        }
        catch (error) {
            console.error("Error creating doctor:", error);
            throw new Error("Failed to create doctor. Please try again.");
        }
    }
    async findDoctorByEmail(email) {
        return await doctors_1.default.findOne({ email }).exec();
    }
    async findDoctorById(id) {
        return await doctors_1.default.findById(id).exec();
    }
    async updateDoctor(id, updateData) {
        return await doctors_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
            strict: true,
        }).exec();
    }
    async deleteDoctor(id) {
        await doctors_1.default.findByIdAndDelete(id).exec();
    }
    async findAll(query = {}) {
        const { page = 1, limit = 10 } = query;
        return await doctors_1.default.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
    }
}
exports.DoctorRepository = DoctorRepository;
