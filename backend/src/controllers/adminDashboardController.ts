import { Request, Response } from 'express';
import {
  fetchSummaryStats,
  fetchAppointmentStatusDistribution,
  fetchPaymentStatusDistribution,
  fetchTimeSeriesData,
  fetchTopDoctors,
  fetchTopPatients,
} from '../services/adminDashboardService';

export const getSummaryStats = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const stats = await fetchSummaryStats(range as string);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getSummaryStats:', error);
    res.status(500).json({ message: 'Failed to fetch summary statistics' });
  }
};

export const getAppointmentStatusDistribution = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const distribution = await fetchAppointmentStatusDistribution(range as string);
    res.status(200).json(distribution);
  } catch (error) {
    console.error('Error in getAppointmentStatusDistribution:', error);
    res.status(500).json({ message: 'Failed to fetch appointment status distribution' });
  }
};

export const getPaymentStatusDistribution = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const distribution = await fetchPaymentStatusDistribution(range as string);
    res.status(200).json(distribution);
  } catch (error) {
    console.error('Error in getPaymentStatusDistribution:', error);
    res.status(500).json({ message: 'Failed to fetch payment status distribution' });
  }
};

export const getTimeSeriesData = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const data = await fetchTimeSeriesData(range as string);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getTimeSeriesData:', error);
    res.status(500).json({ message: 'Failed to fetch time series data' });
  }
};

export const getTopDoctors = async (req: Request, res: Response) => {
  try {
    const { range, limit } = req.query;
    const topDoctors = await fetchTopDoctors(range as string, parseInt(limit as string));
    res.status(200).json(topDoctors);
  } catch (error) {
    console.error('Error in getTopDoctors:', error);
    res.status(500).json({ message: 'Failed to fetch top doctors' });
  }
};

export const getTopPatients = async (req: Request, res: Response) => {
  try {
    const { range, limit } = req.query;
    const topPatients = await fetchTopPatients(range as string, parseInt(limit as string));
    res.status(200).json(topPatients);
  } catch (error) {
    console.error('Error in getTopPatients:', error);
    res.status(500).json({ message: 'Failed to fetch top patients' });
  }
};