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
    constructor(repository) {
        this.repository = repository;
    }
    async registerDoctor(doctorData) {
        doctorData.status = "pending";
        return this.repository.create(doctorData);
    }
    async loginDoctor(email, password) {
        const doctor = await this.repository.findByEmail(email);
        if (!doctor || !doctor.password)
            return null;
        const isPasswordValid = await bcrypt_1.default.compare(password, doctor.password);
        if (!isPasswordValid)
            return null;
        if (doctor.isBlocked)
            throw new Error("Your account has been blocked");
        const token = tokenService_1.default.generateToken({
            id: doctor._id,
            email: doctor.email,
            role: "doctor",
        });
        return { doctor, token };
    }
    async getAllDoctors() {
        return this.repository.findAll();
    }
    async getDoctorById(id) {
        return this.repository.findById(id);
    }
    async addDoctor(doctorData) {
        doctorData.status = "approved";
        const doctor = await this.repository.create(doctorData);
        const resetToken = tokenService_1.default.generateToken({ id: doctor._id, email: doctor.email }, "24h");
        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/doctors/set-password/${resetToken}`;
        await emailService_1.default.sendPasswordResetEmail(doctor.email, resetLink);
        return doctor;
    }
    async updateDoctor(id, updateData) {
        return this.repository.update(id, updateData);
    }
    async deleteDoctor(id) {
        await this.repository.delete(id);
    }
    async approveDoctor(doctorId, status) {
        return this.repository.updateStatus(doctorId, status);
    }
    async sendResetLink(email) {
        const doctor = await this.repository.findByEmail(email);
        if (!doctor)
            throw new Error("Doctor not found");
        const resetToken = tokenService_1.default.generateToken({ doctorId: doctor._id.toString(), email, role: "doctor" }, "1h");
        const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/doctor/resetPassword/${resetToken}`;
        await emailService_1.default.sendPasswordResetEmail(email, resetLink);
    }
    async resetPassword(token, newPassword) {
        const decoded = tokenService_1.default.verifyToken(token);
        if (!decoded?.doctorId)
            throw new Error("Invalid token");
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await this.repository.update(decoded.doctorId, { password: hashedPassword });
    }
    async setPassword(token, password) {
        const decoded = tokenService_1.default.verifyToken(token);
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await this.repository.update(decoded.id, { password: hashedPassword });
    }
}
exports.DoctorService = DoctorService;
