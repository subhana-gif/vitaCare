"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointmentController_1 = require("../controllers/appointmentController");
const router = express_1.default.Router();
// Create a new appointment with validation
router.post('/book', async (req, res, next) => {
    await (0, appointmentController_1.createAppointment)(req, res);
});
// Get appointments for a specific doctor
router.get('/doctor/:doctorId', appointmentController_1.getDoctorAppointments);
// Get appointments for a specific patient
router.get('/patient/:patientId', appointmentController_1.getPatientAppointments);
// Update appointment status
router.patch('/:appointmentId/status', async (req, res, next) => {
    await (0, appointmentController_1.updateAppointmentStatus)(req, res);
});
// Update payment status
router.patch('/:appointmentId/payment', async (req, res, next) => {
    await (0, appointmentController_1.updatePaymentStatus)(req, res);
});
exports.default = router;
