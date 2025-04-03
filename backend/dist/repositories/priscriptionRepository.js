"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionRepository = void 0;
const prescription_model_1 = __importDefault(require("../models/prescription.model"));
const mongoose_1 = require("mongoose");
class PrescriptionRepository {
    async create(prescriptionData) {
        const prescription = new prescription_model_1.default(prescriptionData);
        return await prescription.save();
    }
    async findByAppointmentId(appointmentId) {
        if (!mongoose_1.Types.ObjectId.isValid(appointmentId)) {
            throw new Error("Invalid appointment ID");
        }
        return await prescription_model_1.default.findOne({ appointmentId });
    }
    async updateByAppointmentId(appointmentId, updateData) {
        if (!mongoose_1.Types.ObjectId.isValid(appointmentId)) {
            throw new Error("Invalid appointment ID");
        }
        return await prescription_model_1.default.findOneAndUpdate({ appointmentId }, updateData, { new: true });
    }
}
exports.PrescriptionRepository = PrescriptionRepository;
