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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const DoctorService_1 = require("../services/DoctorService");
const doctorRepository_1 = require("../repositories/doctorRepository");
const HttpStatus_1 = require("../enums/HttpStatus");
class AppointmentController {
    constructor(appointmentService, notificationService, doctorService = new DoctorService_1.DoctorService(new doctorRepository_1.DoctorRepository())) {
        this.appointmentService = appointmentService;
        this.notificationService = notificationService;
        this.doctorService = doctorService;
    }
    bookAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const appointment = yield this.appointmentService.bookAppointment(req.body);
                const doctor = yield this.doctorService.getDoctorById(appointment.doctorId.toString());
                if (doctor) {
                    const notification = yield this.notificationService.createNotification({
                        recipientId: appointment.doctorId.toString(),
                        recipientRole: "doctor",
                        message: `New appointment booked with you by ${((_a = req.user) === null || _a === void 0 ? void 0 : _a.name) || 'a patient'} on ${appointment.date} at ${appointment.time}`,
                    });
                    (_b = req.io) === null || _b === void 0 ? void 0 : _b.to(appointment.doctorId.toString()).emit("newNotification", notification);
                }
                res.status(HttpStatus_1.HttpStatus.CREATED).json({
                    message: "Appointment booked successfully.",
                    appointment,
                });
            }
            catch (error) {
                console.error("Error booking:", error);
                const message = error instanceof Error ? error.message : "Failed to book appointment.";
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message });
            }
        });
    }
    updateStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { appointmentId } = req.params;
                const { status } = req.body;
                const updatedAppointment = yield this.appointmentService.updateAppointmentStatus(appointmentId, status);
                res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: "Appointment status updated successfully.",
                    updatedAppointment
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Failed to update appointment status.";
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message });
            }
        });
    }
    getDoctorAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const appointments = yield this.appointmentService.getAppointmentsByDoctor(doctorId);
                res.status(HttpStatus_1.HttpStatus.OK).json({ appointments });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Failed to fetch doctor appointments.";
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message });
            }
        });
    }
    getPatientAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { patientId } = req.params;
                const appointments = yield this.appointmentService.getAppointmentsByPatient(patientId);
                res.status(HttpStatus_1.HttpStatus.OK).json({ appointments });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Failed to fetch patient appointments.";
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message });
            }
        });
    }
    getAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const appointments = yield this.appointmentService.getAppointmentsByUserId(userId);
                res.status(HttpStatus_1.HttpStatus.OK).json({ appointments });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Failed to fetch appointments.";
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message });
            }
        });
    }
    cancelAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield this.appointmentService.cancelAppointment(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: "Appointment cancelled successfully." });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Failed to cancel appointment.";
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message });
            }
        });
    }
    getAllAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const appointments = yield this.appointmentService.getAllAppointments();
                res.status(HttpStatus_1.HttpStatus.OK).json({ appointments });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Failed to fetch all appointments.";
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message });
            }
        });
    }
}
exports.AppointmentController = AppointmentController;
