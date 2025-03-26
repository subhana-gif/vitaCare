import { Request, Response } from 'express';
import {getAppointmentSummaryService,getPaymentSummaryService,getPopularTimeSlotsService,getMonthlyStatsService,
  getTodayAppointmentsService} from '../services/dashboardService';
import { handleErrorResponse } from '../utils/errorHandler';

export const getAppointmentSummary = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { range } = req.query;
    const summary = await getAppointmentSummaryService(doctorId, range as string);
    res.status(200).json(summary);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch appointment summary');
  }
};

export const getPaymentSummary = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { range } = req.query;
    const summary = await getPaymentSummaryService(doctorId, range as string);
    res.status(200).json(summary);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch payment summary');
  }
};

export const getPopularTimeSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { range } = req.query;
    const timeSlots = await getPopularTimeSlotsService(doctorId, range as string);
    res.status(200).json(timeSlots);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch popular time slots');
  }
};

export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { months } = req.query;
    const stats = await getMonthlyStatsService(doctorId, parseInt(months as string));
    res.status(200).json(stats);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch monthly stats');
  }
};

export const getTodayAppointments = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const appointments = await getTodayAppointmentsService(doctorId);
    res.status(200).json(appointments);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch today\'s appointments');
  }
};