import { Types } from 'mongoose';
import Appointment from '../models/appointment';

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

// Helper function to calculate start date based on range
const getStartDate = (range: string): Date => {
  const now = new Date();
  switch (range) {
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setMonth(now.getMonth() - 1));
  }
};

export const getAppointmentSummaryFromRepo = async (
  doctorId: string,
  range: string
): Promise<AppointmentSummary> => {
  const startDate = getStartDate(range);

  const appointments = await Appointment.find({
    doctorId: new Types.ObjectId(doctorId),
    date: { $gte: startDate.toISOString() }, // Ensure date comparison works
  });

  const summary: AppointmentSummary = {
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };

  return summary;
};

export const getPaymentSummaryFromRepo = async (
  doctorId: string,
  range: string
): Promise<PaymentSummary> => {
  const startDate = getStartDate(range);

  const appointments = await Appointment.find({
    doctorId: new Types.ObjectId(doctorId),
    date: { $gte: startDate.toISOString() },
  });

  const paymentSummary: PaymentSummary = {
    pending: appointments.filter((a) => a.paymentStatus === 'pending').length,
    paid: appointments.filter((a) => a.paymentStatus === 'paid').length,
    refunded: appointments.filter((a) => a.paymentStatus === 'refunded').length,
    totalRevenue: appointments
      .filter((a) => a.paymentStatus === 'paid')
      .reduce((sum, a) => sum + a.appointmentFee, 0),
  };

  return paymentSummary;
};

export const getPopularTimeSlotsFromRepo = async (
  doctorId: string,
  range: string
): Promise<TimeSlotData[]> => {
  const startDate = getStartDate(range);

  const timeSlots = await Appointment.aggregate([
    {
      $match: {
        doctorId: new Types.ObjectId(doctorId),
        date: { $gte: startDate.toISOString() },
      },
    },
    {
      $group: {
        _id: '$time',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  return timeSlots.map((slot) => ({
    slot: slot._id,
    count: slot.count,
  }));
};

export const getMonthlyStatsFromRepo = async (
  doctorId: string,
  months: number
): Promise<MonthlyData[]> => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const stats = await Appointment.aggregate([
    {
      $match: {
        doctorId: new Types.ObjectId(doctorId),
        // Convert the string date to a Date object for comparison
        $expr: {
          $gte: [
            { $dateFromString: { dateString: '$date', format: '%Y-%m-%d' } }, // Adjust the format if needed
            startDate,
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m',
            date: { $dateFromString: { dateString: '$date', format: '%Y-%m-%d' } }, // Convert string to Date
          },
        },
        appointments: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$appointmentFee', 0],
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return stats.map((stat) => ({
    month: stat._id,
    appointments: stat.appointments,
    revenue: stat.revenue,
  }));
};