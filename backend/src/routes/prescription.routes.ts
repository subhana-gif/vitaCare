import express from 'express';
import { createPrescription, getPrescriptionByAppointment, downloadPrescription } from '../controllers/prescription.controller';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

// Create a new prescription
router.post('/', verifyToken(["doctor"]), async (req, res, next) => {
    try {
        await createPrescription(req, res);
    } catch (error) {
        next(error);
    }
});

// Get prescription by appointment ID
router.get('/:appointmentId', verifyToken(["user","doctor"]), async (req, res, next) => {
    try {
        await getPrescriptionByAppointment(req, res);
    } catch (error) {
        next(error);
    }
});

// Download prescription as PDF
router.get('/:appointmentId/download', verifyToken(["user"]), async (req, res, next) => {
    try {
        await downloadPrescription(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;