import express from 'express';
import { PrescriptionController } from '../controllers/prescription.controller';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();
const prescriptionController = new PrescriptionController();

// Create/update a prescription
router.post('/', verifyToken(["doctor"]), prescriptionController.createPrescription);

// Get prescription by appointment ID
router.get('/:appointmentId', verifyToken(["user","doctor"]), prescriptionController.getPrescriptionByAppointment);

// Download prescription as PDF
router.get('/:appointmentId/download', verifyToken(["user"]), prescriptionController.downloadPrescription);

export default router;