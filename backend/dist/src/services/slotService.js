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
const mongoose_1 = require("mongoose");
const slotRepository_1 = __importDefault(require("../repositories/slotRepository"));
class SlotService {
    addSlot(doctorId, dayOfWeek, startTime, endTime, price, token, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token)
                throw new Error("Token is required");
            const doctorObjectId = new mongoose_1.Types.ObjectId(doctorId);
            const parsedStartDate = startDate ? new Date(startDate) : undefined;
            const parsedEndDate = endDate ? new Date(endDate) : undefined;
            // Validate date range if provided
            if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
                throw new Error("Start date cannot be after end date");
            }
            // Check for overlapping slots considering date range
            const existingSlots = yield this.getSlotsByDoctorAndDay(doctorId, dayOfWeek, new Date());
            const newStart = new Date(`1970-01-01T${startTime}`);
            const newEnd = new Date(`1970-01-01T${endTime}`);
            for (const slot of existingSlots) {
                // Skip if date ranges don't overlap
                if (parsedStartDate && parsedEndDate && slot.startDate && slot.endDate) {
                    if (parsedEndDate < slot.startDate || parsedStartDate > slot.endDate) {
                        continue;
                    }
                }
                const existingStart = new Date(`1970-01-01T${slot.startTime}`);
                const existingEnd = new Date(`1970-01-01T${slot.endTime}`);
                if (newStart < existingEnd && newEnd > existingStart) {
                    throw new Error(`Slot overlaps with existing slot on ${dayOfWeek}`);
                }
            }
            const slotData = {
                doctorId: doctorObjectId,
                dayOfWeek,
                startTime,
                endTime,
                price,
                status: "available",
                isAvailable: true,
                startDate: parsedStartDate,
                endDate: parsedEndDate
            };
            return yield slotRepository_1.default.createSlot(slotData);
        });
    }
    updateSlot(slotId, updatedData, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token)
                throw new Error("Token is required");
            const slot = yield slotRepository_1.default.getSlotById(slotId);
            if (!slot)
                throw new Error("Slot not found");
            // Parse dates if provided
            const parsedStartDate = updatedData.startDate ? new Date(updatedData.startDate) : undefined;
            const parsedEndDate = updatedData.endDate ? new Date(updatedData.endDate) : undefined;
            // Validate date range if provided
            if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
                throw new Error("Start date cannot be after end date");
            }
            if (updatedData.startTime || updatedData.endTime) {
                const startTime = updatedData.startTime || slot.startTime;
                const endTime = updatedData.endTime || slot.endTime;
                const existingSlots = yield this.getSlotsByDoctorAndDay(slot.doctorId.toString(), slot.dayOfWeek, new Date());
                const newStart = new Date(`1970-01-01T${startTime}`);
                const newEnd = new Date(`1970-01-01T${endTime}`);
                for (const existing of existingSlots) {
                    if (existing._id.toString() === slotId)
                        continue;
                    // Skip if date ranges don't overlap
                    if (parsedStartDate && parsedEndDate && existing.startDate && existing.endDate) {
                        if (parsedEndDate < existing.startDate || parsedStartDate > existing.endDate) {
                            continue;
                        }
                    }
                    const existingStart = new Date(`1970-01-01T${existing.startTime}`);
                    const existingEnd = new Date(`1970-01-01T${existing.endTime}`);
                    if (newStart < existingEnd && newEnd > existingStart) {
                        throw new Error("Updated slot overlaps with existing slot");
                    }
                }
            }
            const updatePayload = Object.assign(Object.assign({}, updatedData), { startDate: parsedStartDate, endDate: parsedEndDate });
            const updatedSlot = yield slotRepository_1.default.updateSlot(slotId, updatePayload);
            if (!updatedSlot)
                throw new Error("Slot not found");
            return updatedSlot;
        });
    }
    fetchSlots(doctorId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!doctorId || !token)
                throw new Error("Doctor ID and token are required");
            return yield slotRepository_1.default.getSlotsByDoctorId(doctorId);
        });
    }
    markSlotUnavailable(slotId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token)
                throw new Error("Token is required");
            return yield slotRepository_1.default.markSlotUnavailable(slotId);
        });
    }
    markSlotAvailable(slotId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token)
                throw new Error("Token is required");
            return yield slotRepository_1.default.markSlotAvailable(slotId);
        });
    }
    getSlotsByDoctorAndDay(doctorId, dayOfWeek, selectedDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slotRepository_1.default.getSlotsByDoctorAndDay(doctorId, dayOfWeek, selectedDate);
        });
    }
    getSlotById(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slotRepository_1.default.getSlotById(slotId);
        });
    }
    markSlotAsBooked(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = yield slotRepository_1.default.markSlotAsBooked(slotId);
            if (!slot)
                throw new Error("Slot not found");
            return slot;
        });
    }
    getSlotByDetails(doctorId, dayOfWeek, time) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slotRepository_1.default.getSlotByDetails(doctorId, dayOfWeek, time);
        });
    }
}
exports.default = new SlotService();
