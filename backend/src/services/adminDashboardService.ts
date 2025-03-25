import {
  getSummaryStatsRepository,
  getAppointmentStatusDistributionRepository,
  getPaymentStatusDistributionRepository,
  getTimeSeriesDataRepository,
  getTopDoctorsRepository,
  getTopPatientsRepository,
} from '../repositories/adminDashboardRepository';
import { DateRangeHelper } from '../utils/dateRangeHelper';

export interface SummaryStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingAppointments: number;
  completedAppointments: number;
}

export interface AppointmentStatusDistribution {
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export interface PaymentStatusDistribution {
  pending: number;
  paid: number;
  refunded: number;
}

export interface TimeSeriesData {
  date: string;
  appointments: number;
  revenue: number;
}

export interface TopDoctor {
  doctorId: string;
  name: string;
  appointments: number;
}

export interface TopPatient {
  patientId: string;
  name: string;
  appointments: number;
}

export const getSummaryStatsService = async (range: string): Promise<SummaryStats> => {
  const startDate = DateRangeHelper.getStartDate(range);
  return await getSummaryStatsRepository(startDate);
};

export const getAppointmentStatusDistributionService = async (
  range: string
): Promise<AppointmentStatusDistribution> => {
  const startDate = DateRangeHelper.getStartDate(range);
  return await getAppointmentStatusDistributionRepository(startDate);
};

export const getPaymentStatusDistributionService = async (
  range: string
): Promise<PaymentStatusDistribution> => {
  const startDate = DateRangeHelper.getStartDate(range);
  return await getPaymentStatusDistributionRepository(startDate);
};

export const getTimeSeriesDataService = async (range: string): Promise<TimeSeriesData[]> => {
  const startDate = DateRangeHelper.getStartDate(range);
  return await getTimeSeriesDataRepository(startDate);
};

export const getTopDoctorsService = async (
  range: string,
  limit: number
): Promise<TopDoctor[]> => {
  const startDate = DateRangeHelper.getStartDate(range);
  return await getTopDoctorsRepository(startDate, limit);
};

export const getTopPatientsService = async (
  range: string,
  limit: number
): Promise<TopPatient[]> => {
  const startDate = DateRangeHelper.getStartDate(range);
  return await getTopPatientsRepository(startDate, limit);
};