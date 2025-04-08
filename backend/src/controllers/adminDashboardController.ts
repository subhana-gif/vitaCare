import { Request, Response } from 'express';
import {getSummaryStatsService,getAppointmentStatusDistributionService,getPaymentStatusDistributionService,
  getTimeSeriesDataService,getTopDoctorsService,getTopPatientsService,} from '../services/adminDashboardService';
import { handleErrorResponse } from '../utils/errorHandler';
import { HttpStatus } from '../enums/HttpStatus';


export const getSummaryStats = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const stats = await getSummaryStatsService(range as string);
    res.status(HttpStatus.OK).json(stats);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch summary statistics');
  }
};

export const getAppointmentStatusDistribution = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const distribution = await getAppointmentStatusDistributionService(range as string);
    res.status(HttpStatus.OK).json(distribution);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch appointment status distribution');
  }
};

export const getPaymentStatusDistribution = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const distribution = await getPaymentStatusDistributionService(range as string);
    res.status(HttpStatus.OK).json(distribution);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch payment status distribution');
  }
};

export const getTimeSeriesData = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const data = await getTimeSeriesDataService(range as string);
    res.status(HttpStatus.OK).json(data);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch time series data');
  }
};

export const getTopDoctors = async (req: Request, res: Response) => {
  try {
    const { range, limit } = req.query;
    const topDoctors = await getTopDoctorsService(
      range as string,
      parseInt(limit as string) || 5
    );
    res.status(HttpStatus.OK).json(topDoctors);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch top doctors');
  }
};

export const getTopPatients = async (req: Request, res: Response) => {
  try {
    const { range, limit } = req.query;
    const topPatients = await getTopPatientsService(
      range as string,
      parseInt(limit as string) || 5
    );
    res.status(HttpStatus.OK).json(topPatients);
  } catch (error) {
    handleErrorResponse(res, error, 'Failed to fetch top patients');
  }
};