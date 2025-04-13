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
exports.PrescriptionService = void 0;
const priscriptionRepository_1 = require("../repositories/priscriptionRepository");
const appointmentService_1 = require("../services/appointmentService");
const DoctorService_1 = require("../services/DoctorService");
const userService_1 = require("./userService");
const pdfkit_1 = __importDefault(require("pdfkit"));
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const appointmentRepository_1 = require("../repositories/appointmentRepository");
const doctorRepository_1 = require("../repositories/doctorRepository");
class PrescriptionService {
    constructor(userService, appointmentRepository, doctorRepository) {
        this.prescriptionRepository = new priscriptionRepository_1.PrescriptionRepository();
        this.appointmentService = new appointmentService_1.AppointmentService(appointmentRepository || new appointmentRepository_1.AppointmentRepository(), new DoctorService_1.DoctorService(doctorRepository || new doctorRepository_1.DoctorRepository()));
        this.doctorService = new DoctorService_1.DoctorService(doctorRepository || new doctorRepository_1.DoctorRepository());
        this.userService = userService || new userService_1.UserService(userRepository_1.default.getInstance());
    }
    createPrescription(prescriptionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.appointmentService.getAppointmentById(prescriptionData.appointmentId.toString());
            if (!appointment) {
                throw new Error("Appointment not found");
            }
            const existingPrescription = yield this.prescriptionRepository.findByAppointmentId(prescriptionData.appointmentId.toString());
            if (existingPrescription) {
                return yield this.prescriptionRepository.updateByAppointmentId(prescriptionData.appointmentId.toString(), prescriptionData);
            }
            return yield this.prescriptionRepository.create(prescriptionData);
        });
    }
    getPrescriptionByAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prescriptionRepository.findByAppointmentId(appointmentId);
        });
    }
    updatePrescription(appointmentId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prescriptionRepository.updateByAppointmentId(appointmentId, updateData);
        });
    }
    generatePdfContent(prescription) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const appointment = yield this.appointmentService.getAppointmentById(prescription.appointmentId.toString());
                    if (!appointment) {
                        throw new Error("Appointment not found");
                    }
                    const doctor = yield this.doctorService.getDoctorById(appointment.doctorId.toString());
                    const patient = yield this.userService.getUserById(appointment.patientId.toString());
                    if (!doctor || !patient) {
                        throw new Error("Doctor or Patient information not found");
                    }
                    const doc = new pdfkit_1.default({
                        size: 'A4',
                        margins: { top: 50, bottom: 50, left: 50, right: 50 }
                    });
                    const buffers = [];
                    doc.on('data', buffers.push.bind(buffers));
                    doc.on('end', () => resolve(Buffer.concat(buffers)));
                    // Header
                    doc.font('Helvetica-Bold')
                        .fontSize(24)
                        .text('Medical Prescription', { align: 'center' })
                        .moveDown(0.5);
                    // Doctor Details
                    doc.font('Helvetica-Bold')
                        .fontSize(14)
                        .text('Prescribed By:', { underline: true });
                    doc.font('Helvetica')
                        .fontSize(12)
                        .text(`Dr. ${doctor.name}`)
                        .text(`Specialization: ${doctor.speciality}`)
                        .moveDown();
                    // Patient Details
                    doc.font('Helvetica-Bold')
                        .fontSize(14)
                        .text('Patient:', { underline: true });
                    doc.font('Helvetica')
                        .fontSize(12)
                        .text(patient.name)
                        .moveDown();
                    // Prescription Details
                    doc.font('Helvetica-Bold')
                        .fontSize(14)
                        .text('Diagnosis:', { underline: true });
                    doc.font('Helvetica')
                        .fontSize(12)
                        .text(prescription.diagnosis)
                        .moveDown();
                    // Medicines
                    doc.font('Helvetica-Bold')
                        .fontSize(14)
                        .text('Prescribed Medicines:', { underline: true });
                    prescription.medicines.forEach((medicine, index) => {
                        doc.font('Helvetica-Bold')
                            .fontSize(12)
                            .text(`${index + 1}. ${medicine.name}`);
                        doc.font('Helvetica')
                            .fontSize(10)
                            .text(`   Dosage: ${medicine.dosage}`)
                            .text(`   Duration: ${medicine.duration}`)
                            .text(`   Timing: ${medicine.timing}`)
                            .moveDown(0.5);
                    });
                    // Additional Notes
                    if (prescription.notes) {
                        doc.font('Helvetica-Bold')
                            .fontSize(14)
                            .text('Additional Notes:', { underline: true });
                        doc.font('Helvetica')
                            .fontSize(12)
                            .text(prescription.notes)
                            .moveDown();
                    }
                    // Footer
                    doc.fontSize(8)
                        .text(`Prescription Generated: ${new Date().toLocaleString()}`);
                    doc.end();
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
exports.PrescriptionService = PrescriptionService;
