import {getAppointmentSummaryRepository,getPaymentSummaryRepository,getPopularTimeSlotsRepository,
  getMonthlyStatsRepository,getTodayAppointmentsRepository} from '../repositories/dashboardRepository';
import { DateRangeHelper } from '../utils/dateRangeHelper';
import { Types } from 'mongoose';

interface AppointmentSummary {
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

interface PaymentSummary {
  pending: number;
  paid: number;
  refunded: number;
  totalRevenue: number;
}

interface TimeSlotData {
  slot: string;
  count: number;
}

interface MonthlyData {
  month: string;
  appointments: number;
  revenue: number;
}

export const getAppointmentSummaryService = async (doctorId: string, range: string): Promise<AppointmentSummary> => {
  const startDate = DateRangeHelper.getStartDate(range);
  return await getAppointmentSummaryRepository(new Types.ObjectId(doctorId), startDate);
};

export const getPaymentSummaryService = async (doctorId: string, range: string): Promise<PaymentSummary> => {
  const startDate = DateRangeHelper.getStartDate(range);
  return await getPaymentSummaryRepository(new Types.ObjectId(doctorId), startDate);
};

export const getPopularTimeSlotsService = async (doctorId: string, range: string): Promise<TimeSlotData[]> => {
  const startDate = DateRangeHelper.getStartDate(range);
  return await getPopularTimeSlotsRepository(new Types.ObjectId(doctorId), startDate);
};

export const getMonthlyStatsService = async (doctorId: string, months: number): Promise<MonthlyData[]> => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  return await getMonthlyStatsRepository(new Types.ObjectId(doctorId), startDate);
};

export const getTodayAppointmentsService = async (doctorId: string) => {
  return await getTodayAppointmentsRepository(new Types.ObjectId(doctorId));
};