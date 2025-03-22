"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorService = void 0;
const emailService_1 = __importDefault(require("./emailService"));
const tokenService_1 = __importDefault(require("./tokenService"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class DoctorService {
    constructor(doctorRepository, notificationService) {
        this.doctorRepository = doctorRepository;
        this.notificationService = notificationService;
    }
    async registerDoctor(doctorData) {
        doctorData.status = "pending";
        const doctor = await this.doctorRepository.createDoctor(doctorData);
        await this.notificationService.createNotification({
            message: `New doctor signup request: ${doctor.name}`,
            type: "doctor_approval",
            doctorId: doctor._id.toString()
        });
        return doctor;
    }
    async loginDoctor(email, password) {
        const result = await this.doctorRepository.loginDoctor(email, password);
        if (!result)
            return null;
        const { doctor } = result;
        if (doctor.isBlocked)
            throw new Error("Your account has been blocked. Please contact support.");
        return result;
    }
    async getAllDoctors() {
        return await this.doctorRepository.findAll();
    }
    async getDoctorById(id) {
        return await this.doctorRepository.findDoctorById(id);
    }
    async getDoctorStatus(doctorId) {
        const doctor = await this.doctorRepository.findDoctorById(doctorId);
        if (!doctor) {
            throw new Error("Doctor not found");
        }
        return doctor.status;
    }
    async updateDoctor(id, updateData) {
        return await this.doctorRepository.updateDoctor(id, updateData);
    }
    async deleteDoctor(id) {
        await this.doctorRepository.deleteDoctor(id);
    }
    async updateDoctorStatus(doctorId, status) {
        const updatedDoctor = await this.doctorRepository.updateDoctor(doctorId, { status });
        if (!updatedDoctor)
            throw new Error("Doctor not found");
        await this.notificationService.deleteNotification({
            doctorId,
            type: "doctor_approval"
        });
        await this.notificationService.createNotification({
            message: `Doctor ${updatedDoctor.name} has been ${status}`,
            type: "doctor_status_update",
            doctorId: updatedDoctor._id.toString()
        });
        return updatedDoctor;
    }
    async addDoctor(doctorData) {
        doctorData.imageUrl = "https://dummyimage.com/150";
        doctorData.status = "approved";
        const doctor = await this.doctorRepository.createDoctor(doctorData);
        const resetToken = tokenService_1.default.generateToken({ doctorId: doctor._id }, "24h");
        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/doctors/set-password/${resetToken}`;
        await emailService_1.default.sendPasswordResetEmail(doctor.email, resetLink);
        return doctor;
    }
    async setPassword(token, password) {
        const decoded = tokenService_1.default.verifyToken(token);
        const doctor = await this.doctorRepository.findDoctorById(decoded.doctorId);
        if (!doctor)
            throw new Error("Invalid token or doctor not found");
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await this.doctorRepository.updateDoctor(doctor._id.toString(), {
            password: hashedPassword,
            resetToken: undefined,
        });
    }
    async sendResetLink(email) {
        const doctor = await this.doctorRepository.findDoctorByEmail(email);
        if (!doctor)
            throw new Error("Doctor not found");
        const resetToken = tokenService_1.default.generateToken({ doctorId: doctor._id.toString() }, "30m");
        await this.doctorRepository.updateDoctor(doctor._id.toString(), {
            resetToken,
            resetTokenExpires: new Date(Date.now() + 30 * 60 * 1000),
        });
        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/doctor/resetPassword/${resetToken}`;
        await emailService_1.default.sendPasswordResetEmail(email, resetLink);
    }
    async resetPassword(token, newPassword) {
        const decoded = tokenService_1.default.verifyToken(token);
        const doctor = await this.doctorRepository.findDoctorById(decoded.doctorId);
        if (!doctor || doctor.resetToken !== token)
            throw new Error("Invalid or expired token");
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await this.doctorRepository.updateDoctor(doctor._id.toString(), {
            password: hashedPassword,
            resetToken: undefined,
        });
    }
}
exports.DoctorService = DoctorService;
