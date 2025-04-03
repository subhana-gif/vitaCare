"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prescription_controller_1 = require("../controllers/prescription.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const prescriptionController = new prescription_controller_1.PrescriptionController();
router.post('/', (0, authMiddleware_1.verifyToken)(["doctor"]), prescriptionController.createPrescription);
router.get('/:appointmentId', (0, authMiddleware_1.verifyToken)(["user", "doctor"]), prescriptionController.getPrescriptionByAppointment);
router.get('/:appointmentId/download', (0, authMiddleware_1.verifyToken)(["user"]), prescriptionController.downloadPrescription);
exports.default = router;
