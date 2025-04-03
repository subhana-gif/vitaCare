"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRepository = void 0;
const appointment_1 = __importDefault(require("../models/appointment"));
class AppointmentRepository {
    async getById(id) {
        return appointment_1.default.findById(id).exec();
    }
    async findByDetails(doctorId, date, time) {
        return appointment_1.default.findOne({ doctorId, date, time }).exec();
    }
    async create(appointmentData) {
        const appointment = new appointment_1.default(appointmentData);
        return appointment.save();
    }
    async update(id, updateData) {
        return appointment_1.default.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }
    async delete(id) {
        await appointment_1.default.findByIdAndDelete(id).exec();
    }
    async getAppointmentsByDoctor(doctorId) {
        return appointment_1.default.find({ doctorId })
            .populate("patientId", "name email phone")
            .exec();
    }
    async getAppointmentsByPatient(patientId) {
        return appointment_1.default.find({ patientId })
            .populate({
            path: 'doctorId',
            select: 'name specialty imageUrl address'
        })
            .exec();
    }
    async getAllAppointments() {
        return appointment_1.default.find()
            .populate("patientId", "name email")
            .populate("doctorId", "name speciality")
            .exec();
    }
    async updatePaymentStatus(appointmentId, paymentStatus, paymentId) {
        const appointmentIdStr = appointmentId.toString();
        const updateData = {
            paymentStatus,
            ...(paymentStatus === 'paid' && { paidAt: new Date() })
        };
        if (paymentId) {
            updateData.paymentId = paymentId;
        }
        const updatedAppointment = await appointment_1.default.findByIdAndUpdate(appointmentIdStr, updateData, { new: true }).exec();
        if (!updatedAppointment) {
            throw new Error(`Appointment not found for ID: ${appointmentIdStr}`);
        }
        return updatedAppointment;
    }
}
exports.AppointmentRepository = AppointmentRepository;
