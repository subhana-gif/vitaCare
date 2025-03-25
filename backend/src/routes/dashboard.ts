import express from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import {getAppointmentSummary, getPaymentSummary, getPopularTimeSlots, 
  getMonthlyStats, getTodayAppointments} from '../controllers/dashboardController';

import {getSummaryStats,getAppointmentStatusDistribution,getPaymentStatusDistribution,
  getTimeSeriesData,getTopDoctors,getTopPatients,} from '../controllers/adminDashboardController';

const router = express.Router();

router.get('/:doctorId/appointments/summary', verifyToken(["doctor"]),getAppointmentSummary);
router.get('/:doctorId/payments/summary', verifyToken(["doctor"]),getPaymentSummary);
router.get('/:doctorId/appointments/time-slots', verifyToken(["doctor"]),getPopularTimeSlots);
router.get('/:doctorId/monthly-stats', verifyToken(["doctor"]),getMonthlyStats);
router.get('/:doctorId/appointments/today',verifyToken(["doctor"]), getTodayAppointments);

router.get('/summary', verifyToken(["admin"]),getSummaryStats);
router.get('/appointment-status', verifyToken(["admin"]),getAppointmentStatusDistribution);
router.get('/payment-status',verifyToken(["admin"]), getPaymentStatusDistribution);
router.get('/time-series', verifyToken(["admin"]),getTimeSeriesData);
router.get('/top-doctors', verifyToken(["admin"]),getTopDoctors);
router.get('/top-patients',verifyToken(["admin"]), getTopPatients);


export default router;