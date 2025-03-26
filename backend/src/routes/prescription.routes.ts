import express from 'express';
import { PrescriptionController } from '../controllers/prescription.controller';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();
const prescriptionController = new PrescriptionController();

router.post('/', verifyToken(["doctor"]), prescriptionController.createPrescription);
router.get('/:appointmentId', verifyToken(["user","doctor"]), prescriptionController.getPrescriptionByAppointment);
router.get('/:appointmentId/download', verifyToken(["user"]), prescriptionController.downloadPrescription);

export default router;