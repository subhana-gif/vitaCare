import {
    getAppointmentSummaryFromRepo,
    getPaymentSummaryFromRepo,
    getPopularTimeSlotsFromRepo,
    getMonthlyStatsFromRepo,
  } from '../repositories/dashboardRepository';
  
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
  
  export const fetchAppointmentSummary = async (
    doctorId: string,
    range: string
  ): Promise<AppointmentSummary> => {
    return await getAppointmentSummaryFromRepo(doctorId, range);
  };
  
  export const fetchPaymentSummary = async (
    doctorId: string,
    range: string
  ): Promise<PaymentSummary> => {
    return await getPaymentSummaryFromRepo(doctorId, range);
  };
  
  export const fetchPopularTimeSlots = async (
    doctorId: string,
    range: string
  ): Promise<TimeSlotData[]> => {
    return await getPopularTimeSlotsFromRepo(doctorId, range);
  };
  
  export const fetchMonthlyStats = async (
    doctorId: string,
    months: number
  ): Promise<MonthlyData[]> => {
    try {
      const stats = await getMonthlyStatsFromRepo(doctorId, months);
      return stats;
    } catch (error) {
      console.error('Error in fetchMonthlyStats:', error); // Log the error
      throw error;
    }
  };