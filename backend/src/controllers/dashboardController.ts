import { Request, Response } from 'express';
import Appointment from "../models/appointment"
import {
  fetchAppointmentSummary,
  fetchPaymentSummary,
  fetchPopularTimeSlots,
  fetchMonthlyStats,
} from '../services/dashboardService';
import { Types } from 'mongoose';

export const getAppointmentSummary = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { range } = req.query;
    // Fetch appointment summary from the database
    const summary = await fetchAppointmentSummary(doctorId, range as string);
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error in getAppointmentSummary:', error);
    res.status(500).json({ message: 'Failed to fetch appointment summary' });
  }
};

export const getPaymentSummary = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { range } = req.query;
    const summary = await fetchPaymentSummary(doctorId, range as string);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payment summary' });
  }
};

export const getPopularTimeSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { range } = req.query;
    const timeSlots = await fetchPopularTimeSlots(doctorId, range as string);
    res.status(200).json(timeSlots);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch popular time slots' });
  }
};

export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const { months } = req.query;
    console.log("doctorid:",doctorId)
    console.log("Months:",months)
    const stats = await fetchMonthlyStats(doctorId, parseInt(months as string));
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch monthly stats' });
  }
};

export const getTodayAppointments = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's appointments
    const appointments = await Appointment.find({
      doctorId: new Types.ObjectId(doctorId),
      date: today, // Match today's date
    }).populate('patientId', 'name email'); // Populate patient details

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error in getTodayAppointments:', error);
    res.status(500).json({ message: 'Failed to fetch today\'s appointments' });
  }
};