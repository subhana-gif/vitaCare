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
exports.PrescriptionController = void 0;
const priscriptionService_1 = require("../services/priscriptionService");
const mongoose_1 = require("mongoose");
const appointmentService_1 = require("../services/appointmentService");
const notificationService_1 = __importDefault(require("../services/notificationService"));
const appointmentRepository_1 = require("../repositories/appointmentRepository");
const doctorRepository_1 = require("../repositories/doctorRepository");
const DoctorService_1 = require("../services/DoctorService");
const HttpStatus_1 = require("../enums/HttpStatus");
class PrescriptionController {
    constructor(appointmentRepository, doctorRepository) {
        this.createPrescription = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { appointmentId, medicines, diagnosis, notes } = req.body;
                if (!mongoose_1.Types.ObjectId.isValid(appointmentId)) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                    return;
                }
                const prescription = yield this.prescriptionService.createPrescription({
                    appointmentId: new mongoose_1.Types.ObjectId(appointmentId),
                    medicines,
                    diagnosis,
                    notes
                });
                const appointment = yield this.appointmentService.getAppointmentById(appointmentId);
                if (!appointment) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
                const doctor = yield this.doctorService.getDoctorById(appointment.doctorId.toString());
                if (!doctor) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
                if (appointment) {
                    const notification = yield this.notificationService.createNotification({
                        recipientId: appointment.patientId.toString(),
                        recipientRole: "user",
                        message: `Your prescription for appointment with doctor ${doctor.name} on 
          ${appointment.date} at ${appointment.time} has been ${req.method === 'POST' ? 'created' : 'updated'}.`,
                    });
                    (_a = req.io) === null || _a === void 0 ? void 0 : _a.to(appointment.patientId.toString()).emit("newNotification", notification);
                }
                res.status(HttpStatus_1.HttpStatus.CREATED).json({
                    success: true,
                    message: HttpStatus_1.HttpMessage.OK,
                    data: prescription,
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                else {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
            }
        });
        this.getPrescriptionByAppointment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { appointmentId } = req.params;
                const prescription = yield this.prescriptionService.getPrescriptionByAppointment(appointmentId);
                if (!prescription) {
                    res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
                res.json(prescription);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                else {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
            }
        });
        this.downloadPrescription = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { appointmentId } = req.params;
                const prescription = yield this.prescriptionService.getPrescriptionByAppointment(appointmentId);
                if (!prescription) {
                    res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
                const pdfBuffer = yield this.prescriptionService.generatePdfContent(prescription);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=prescription_${appointmentId}.pdf`);
                res.send(pdfBuffer);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
                else {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                }
            }
        });
        this.prescriptionService = new priscriptionService_1.PrescriptionService();
        this.notificationService = notificationService_1.default;
        this.doctorService = new DoctorService_1.DoctorService(doctorRepository || new doctorRepository_1.DoctorRepository());
        this.appointmentService = new appointmentService_1.AppointmentService(appointmentRepository || new appointmentRepository_1.AppointmentRepository(), new DoctorService_1.DoctorService(doctorRepository || new doctorRepository_1.DoctorRepository()));
    }
}
exports.PrescriptionController = PrescriptionController;
