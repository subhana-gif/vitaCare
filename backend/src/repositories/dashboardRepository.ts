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

export const getAppointmentSummaryRepository = async (
  doctorId: Types.ObjectId,
  startDate: Date
): Promise<AppointmentSummary> => {
  const appointments = await Appointment.find({
    doctorId,
    date: { $gte: startDate.toISOString() },
  });

  return {
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };
};

export const getPaymentSummaryRepository = async (
  doctorId: Types.ObjectId,
  startDate: Date
): Promise<PaymentSummary> => {
  const appointments = await Appointment.find({
    doctorId,
    date: { $gte: startDate.toISOString() },
  });

  return {
    pending: appointments.filter((a) => a.paymentStatus === 'pending').length,
    paid: appointments.filter((a) => a.paymentStatus === 'paid').length,
    refunded: appointments.filter((a) => a.paymentStatus === 'refunded').length,
    totalRevenue: appointments
      .filter((a) => a.paymentStatus === 'paid')
      .reduce((sum, a) => sum + a.appointmentFee, 0),
  };
};

export const getPopularTimeSlotsRepository = async (
  doctorId: Types.ObjectId,
  startDate: Date
): Promise<TimeSlotData[]> => {
  const timeSlots = await Appointment.aggregate([
    {
      $match: {
        doctorId,
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

export const getMonthlyStatsRepository = async (
  doctorId: Types.ObjectId,
  startDate: Date
): Promise<MonthlyData[]> => {
  const stats = await Appointment.aggregate([
    {
      $match: {
        doctorId,
        $expr: {
          $gte: [
            { $dateFromString: { dateString: '$date', format: '%Y-%m-%d' } },
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
            date: { $dateFromString: { dateString: '$date', format: '%Y-%m-%d' } },
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

export const getTodayAppointmentsRepository = async (doctorId: Types.ObjectId) => {
  const today = new Date().toISOString().split('T')[0];
  return await Appointment.find({
    doctorId,
    date: today,
  }).populate('patientId', 'name email');
};