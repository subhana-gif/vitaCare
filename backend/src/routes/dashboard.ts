import express from 'express';
import {
  getAppointmentSummary,
  getPaymentSummary,
  getPopularTimeSlots,
  getMonthlyStats,
  getTodayAppointments
} from '../controllers/dashboardController';
import {
  getSummaryStats,
  getAppointmentStatusDistribution,
  getPaymentStatusDistribution,
  getTimeSeriesData,
  getTopDoctors,
  getTopPatients,
} from '../controllers/adminDashboardController';

const router = express.Router();

// Dashboard routes
router.get('/:doctorId/appointments/summary', getAppointmentSummary);
router.get('/:doctorId/payments/summary', getPaymentSummary);
router.get('/:doctorId/appointments/time-slots', getPopularTimeSlots);
router.get('/:doctorId/monthly-stats', getMonthlyStats);
router.get('/:doctorId/appointments/today', getTodayAppointments);

router.get('/summary', getSummaryStats);
router.get('/appointment-status', getAppointmentStatusDistribution);
router.get('/payment-status', getPaymentStatusDistribution);
router.get('/time-series', getTimeSeriesData);
router.get('/top-doctors', getTopDoctors);
router.get('/top-patients', getTopPatients);


export default router;