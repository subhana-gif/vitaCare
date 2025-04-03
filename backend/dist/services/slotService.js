"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slotRepository_1 = __importDefault(require("../repositories/slotRepository"));
class SlotService {
    async addSlot(slotData) {
        return await slotRepository_1.default.createSlot(slotData);
    }
    async getSlotsByDoctorId(doctorId) {
        return await slotRepository_1.default.getSlotsByDoctorId(doctorId);
    }
    async updateSlot(slotId, updatedData) {
        const slot = await slotRepository_1.default.updateSlot(slotId, updatedData);
        if (!slot) {
            throw new Error("Slot not found.");
        }
        return slot;
    }
    async markSlotUnavailable(slotId) {
        return await slotRepository_1.default.markSlotUnavailable(slotId);
    }
    async markSlotAvailable(slotId) {
        return await slotRepository_1.default.markSlotAvailable(slotId);
    }
    async getSlotsByDoctorAndDate(doctorId, date) {
        return await slotRepository_1.default.getSlotsByDoctorAndDate(doctorId, date);
    }
    async markSlotAsBooked(slotId) {
        const slot = await slotRepository_1.default.markSlotAsBooked(slotId);
        if (!slot)
            throw new Error("Slot not found.");
        return slot;
    }
    async getSlotByDetails(doctorId, date, time) {
        return await slotRepository_1.default.getSlotByDetails(doctorId, date, time);
    }
}
exports.default = new SlotService();
