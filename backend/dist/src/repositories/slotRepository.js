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
const slot_1 = __importDefault(require("../models/slot"));
exports.default = {
    createSlot(slotData) {
        return __awaiter(this, void 0, void 0, function* () {
            const slot = new slot_1.default(slotData);
            return yield slot.save();
        });
    },
    getSlotsByDoctorId(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_1.default.find({ doctorId }).exec();
        });
    },
    getSlotById(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_1.default.findById(slotId).exec();
        });
    },
    updateSlot(slotId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_1.default.findByIdAndUpdate(slotId, updatedData, { new: true }).exec();
        });
    },
    markSlotUnavailable(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_1.default.findByIdAndUpdate(slotId, { isAvailable: false }, { new: true }).exec();
        });
    },
    markSlotAvailable(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_1.default.findByIdAndUpdate(slotId, { isAvailable: true }, { new: true }).exec();
        });
    },
    getSlotsByDoctorAndDay(doctorId, dayOfWeek, selectedDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_1.default.find({ doctorId,
                dayOfWeek,
                $or: [
                    // Slots with no date range (available every week)
                    { startDate: { $exists: false }, endDate: { $exists: false } },
                    // Slots where selected date is within the date range
                    {
                        startDate: { $lte: selectedDate },
                        endDate: { $gte: selectedDate }
                    },
                    // Slots with only start date (available from start date onward)
                    {
                        startDate: { $lte: selectedDate },
                        endDate: { $exists: false }
                    },
                    // Slots with only end date (available until end date)
                    {
                        startDate: { $exists: false },
                        endDate: { $gte: selectedDate }
                    }
                ],
                isAvailable: true
            }).exec();
        });
    },
    markSlotAsBooked(slotId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_1.default.findByIdAndUpdate(slotId, { status: "booked", isAvailable: false }, { new: true }).exec();
        });
    },
    getSlotByDetails(doctorId, dayOfWeek, time) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield slot_1.default.findOne({
                doctorId,
                dayOfWeek,
                startTime: { $lte: time },
                endTime: { $gte: time }
            }).exec();
        });
    }
};
