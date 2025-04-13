"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    registerDoctor(doctorData) {
        return __awaiter(this, void 0, void 0, function* () {
            doctorData.status = "pending";
            return this.repository.create(doctorData);
        });
    }
    loginDoctor(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.repository.findByEmail(email);
            if (!doctor || !doctor.password)
                return null;
            const isPasswordValid = yield bcrypt_1.default.compare(password, doctor.password);
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
        });
    }
    getAllDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repository.findAll();
        });
    }
    getDoctorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repository.findById(id);
        });
    }
    addDoctor(doctorData) {
        return __awaiter(this, void 0, void 0, function* () {
            doctorData.status = "approved";
            const doctor = yield this.repository.create(doctorData);
            const resetToken = tokenService_1.default.generateToken({ id: doctor._id, email: doctor.email, role: "admin" }, "24h");
            console.log("set password token:", resetToken);
            const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/doctors/set-password/${resetToken}`;
            yield emailService_1.default.sendPasswordResetEmail(doctor.email, resetLink);
            return doctor;
        });
    }
    updateDoctor(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repository.update(id, updateData);
        });
    }
    deleteDoctor(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repository.delete(id);
        });
    }
    approveDoctor(doctorId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.repository.updateStatus(doctorId, status);
        });
    }
    sendResetLink(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.repository.findByEmail(email);
            if (!doctor)
                throw new Error("Doctor not found");
            const resetToken = tokenService_1.default.generateToken({ doctorId: doctor._id.toString(), email, role: "doctor" }, "1h");
            const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/doctor/resetPassword/${resetToken}`;
            yield emailService_1.default.sendPasswordResetEmail(email, resetLink);
        });
    }
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = tokenService_1.default.verifyToken(token);
            if (!(decoded === null || decoded === void 0 ? void 0 : decoded.doctorId))
                throw new Error("Invalid token");
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            yield this.repository.update(decoded.doctorId, { password: hashedPassword });
        });
    }
    setPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = tokenService_1.default.verifyToken(token);
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            yield this.repository.update(decoded.id, { password: hashedPassword });
        });
    }
}
exports.DoctorService = DoctorService;
