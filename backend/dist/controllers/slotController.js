"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slotService_1 = __importDefault(require("../services/slotService"));
const asyncHandlers_1 = __importDefault(require("../utils/asyncHandlers"));
class SlotController {
    constructor() {
        this.addSlot = (0, asyncHandlers_1.default)(async (req, res) => {
            const slot = await slotService_1.default.addSlot(req.body);
            res.status(201).json({ message: "Slot added successfully", slot });
        });
        this.getSlotsByDoctorId = (0, asyncHandlers_1.default)(async (req, res) => {
            const { doctorId } = req.params;
            const slots = await slotService_1.default.getSlotsByDoctorId(doctorId);
            res.status(200).json({ slots });
        });
        this.updateSlot = (0, asyncHandlers_1.default)(async (req, res) => {
            const { slotId } = req.params;
            const { price, date, startTime, endTime } = req.body;
            const updatedSlot = await slotService_1.default.updateSlot(slotId, { price, date, startTime, endTime });
            if (!updatedSlot) {
                return res.status(404).json({ message: "Slot not found." });
            }
            res.status(200).json({ message: "Slot updated successfully!", updatedSlot });
        });
        this.markSlotUnavailable = (0, asyncHandlers_1.default)(async (req, res) => {
            const { slotId } = req.params;
            const updatedSlot = await slotService_1.default.markSlotUnavailable(slotId);
            if (!updatedSlot) {
                return res.status(404).json({ message: "Slot not found" });
            }
            res.status(200).json({ message: "Slot marked as unavailable", updatedSlot });
        });
        this.markSlotAvailable = (0, asyncHandlers_1.default)(async (req, res) => {
            const { slotId } = req.params;
            const updatedSlot = await slotService_1.default.markSlotAvailable(slotId);
            if (!updatedSlot) {
                return res.status(404).json({ message: "Slot not found" });
            }
            res.status(200).json({ message: "Slot marked as available", updatedSlot });
        });
        this.getSlotsByDoctorAndDate = (0, asyncHandlers_1.default)(async (req, res) => {
            const { doctorId, date } = req.params;
            const slots = await slotService_1.default.getSlotsByDoctorAndDate(doctorId, date);
            if (!slots.length) {
                return res.status(404).json({ message: "No available slots found." });
            }
            res.status(200).json({ slots });
        });
        this.markSlotAsBooked = (0, asyncHandlers_1.default)(async (req, res) => {
            const { slotId } = req.params;
            const bookedSlot = await slotService_1.default.markSlotAsBooked(slotId);
            if (!bookedSlot) {
                return res.status(404).json({ message: "Slot not found." });
            }
            res.status(200).json({ message: "Slot marked as booked.", bookedSlot });
        });
    }
}
exports.default = new SlotController();
