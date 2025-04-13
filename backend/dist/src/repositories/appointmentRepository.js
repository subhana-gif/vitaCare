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
exports.AppointmentRepository = void 0;
const appointment_1 = __importDefault(require("../models/appointment"));
class AppointmentRepository {
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return appointment_1.default.findById(id).exec();
        });
    }
    findByDetails(doctorId, date, time) {
        return __awaiter(this, void 0, void 0, function* () {
            return appointment_1.default.findOne({ doctorId, date, time }).exec();
        });
    }
    create(appointmentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = new appointment_1.default(appointmentData);
            return appointment.save();
        });
    }
    update(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return appointment_1.default.findByIdAndUpdate(id, updateData, { new: true }).exec();
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield appointment_1.default.findByIdAndDelete(id).exec();
        });
    }
    getAppointmentsByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return appointment_1.default.find({ doctorId })
                .populate("patientId", "name email phone")
                .exec();
        });
    }
    getAppointmentsByPatient(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return appointment_1.default.find({ patientId })
                .populate({
                path: 'doctorId',
                select: 'name speciality imageUrl address'
            })
                .exec();
        });
    }
    getAllAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            return appointment_1.default.find()
                .populate("patientId", "name email")
                .populate("doctorId", "name speciality")
                .exec();
        });
    }
    updatePaymentStatus(appointmentId, paymentStatus, paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointmentIdStr = appointmentId.toString();
            const updateData = Object.assign({ paymentStatus }, (paymentStatus === 'paid' && { paidAt: new Date() }));
            if (paymentId) {
                updateData.paymentId = paymentId;
            }
            const updatedAppointment = yield appointment_1.default.findByIdAndUpdate(appointmentIdStr, updateData, { new: true }).exec();
            if (!updatedAppointment) {
                throw new Error(`Appointment not found for ID: ${appointmentIdStr}`);
            }
            return updatedAppointment;
        });
    }
}
exports.AppointmentRepository = AppointmentRepository;
