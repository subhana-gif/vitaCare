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
const slotService_1 = __importDefault(require("../services/slotService"));
const asyncHandlers_1 = __importDefault(require("../utils/asyncHandlers"));
const HttpStatus_1 = require("../enums/HttpStatus");
class SlotController {
    constructor() {
        this.addSlot = (0, asyncHandlers_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { doctorId, dayOfWeek, startTime, endTime, price, startDate, endDate } = req.body;
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token) {
                return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: HttpStatus_1.HttpMessage.UNAUTHORIZED });
            }
            if (!doctorId || !dayOfWeek || !startTime || !endTime || price === undefined) {
                return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
            }
            const slot = yield slotService_1.default.addSlot(doctorId, dayOfWeek, startTime, endTime, price, token, startDate, endDate);
            res.status(HttpStatus_1.HttpStatus.CREATED).json({ message: HttpStatus_1.HttpMessage.CREATED, slot });
        }));
        this.updateSlot = (0, asyncHandlers_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { slotId } = req.params;
            const { price, date, startTime, endTime, startDate, endDate } = req.body;
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token) {
                return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: HttpStatus_1.HttpMessage.UNAUTHORIZED });
            }
            const updatedSlot = yield slotService_1.default.updateSlot(slotId, { price, date, startTime, endTime, startDate, endDate }, token);
            if (!updatedSlot) {
                return res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
            }
            res.status(HttpStatus_1.HttpStatus.OK).json({ message: HttpStatus_1.HttpMessage.OK, slot: updatedSlot });
        }));
        this.getSlotsByDoctorId = (0, asyncHandlers_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { doctorId } = req.params;
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token) {
                return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: HttpStatus_1.HttpMessage.UNAUTHORIZED });
            }
            const slots = yield slotService_1.default.fetchSlots(doctorId, token);
            res.status(HttpStatus_1.HttpStatus.OK).json({ slots });
        }));
        this.markSlotUnavailable = (0, asyncHandlers_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { slotId } = req.params;
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token) {
                return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: HttpStatus_1.HttpMessage.UNAUTHORIZED });
            }
            const updatedSlot = yield slotService_1.default.markSlotUnavailable(slotId, token);
            if (!updatedSlot) {
                return res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
            }
            res.status(200).json({ message: HttpStatus_1.HttpMessage.OK });
        }));
        this.markSlotAvailable = (0, asyncHandlers_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { slotId } = req.params;
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token) {
                return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: HttpStatus_1.HttpMessage.UNAUTHORIZED });
            }
            const updatedSlot = yield slotService_1.default.markSlotAvailable(slotId, token);
            if (!updatedSlot) {
                return res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
            }
            res.status(HttpStatus_1.HttpStatus.OK).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
        }));
        this.getSlotsByDoctorAndDate = (0, asyncHandlers_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { doctorId, selectedDate } = req.params;
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token) {
                return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: HttpStatus_1.HttpMessage.UNAUTHORIZED });
            }
            try {
                // Parse the selected date
                const date = new Date(selectedDate);
                if (isNaN(date.getTime())) {
                    return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: "Invalid date format" });
                }
                // Get day of week from the date
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                // Get slots for this doctor and date
                const slots = yield slotService_1.default.getSlotsByDoctorAndDay(doctorId, dayOfWeek, date);
                res.status(HttpStatus_1.HttpStatus.OK).json({ slots });
            }
            catch (error) {
                console.error("Error fetching slots by date:", error);
                res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: "Error fetching slots"
                });
            }
        }));
        this.markSlotAsBooked = (0, asyncHandlers_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { slotId } = req.params;
            const bookedSlot = yield slotService_1.default.markSlotAsBooked(slotId);
            if (!bookedSlot) {
                return res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
            }
            res.status(HttpStatus_1.HttpStatus.OK).json({ message: HttpStatus_1.HttpMessage.OK });
        }));
    }
}
exports.default = new SlotController();
