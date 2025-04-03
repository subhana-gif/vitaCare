"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slot_1 = __importDefault(require("../models/slot"));
class SlotRepository {
    async createSlot(slotData) {
        return await slot_1.default.create(slotData);
    }
    async getSlotsByDoctorId(doctorId) {
        return await slot_1.default.find({ doctorId });
    }
    async updateSlot(slotId, updatedData) {
        return await slot_1.default.findByIdAndUpdate(slotId, updatedData, { new: true });
    }
    async markSlotUnavailable(slotId) {
        return await slot_1.default.findByIdAndUpdate(slotId, { isAvailable: false }, { new: true });
    }
    async markSlotAvailable(slotId) {
        return await slot_1.default.findByIdAndUpdate(slotId, { isAvailable: true }, { new: true });
    }
    async getSlotsByDoctorAndDate(doctorId, date) {
        return await slot_1.default.find({ doctorId, date, isAvailable: true });
    }
    async markSlotAsBooked(slotId) {
        return await slot_1.default.findByIdAndUpdate(slotId, { status: "booked", isAvailable: false }, { new: true });
    }
    async getSlotByDetails(doctorId, date, time) {
        return await slot_1.default.findOne({
            doctorId,
            date,
            startTime: { $lte: time },
            endTime: { $gt: time },
            isAvailable: true
        });
    }
}
exports.default = new SlotRepository();
