import Appointment from '../models/appointment';
import Doctor from '../models/doctors';
import Patient from '../models/user';
import {
  SummaryStats,
  AppointmentStatusDistribution,
  PaymentStatusDistribution,
  TimeSeriesData,
  TopDoctor,
  TopPatient,
} from '../services/adminDashboardService';

export const getSummaryStatsRepository = async (startDate: Date): Promise<SummaryStats> => {
  const [totalDoctors, totalPatients, appointments] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Appointment.find({ date: { $gte: startDate.toISOString() } }),
  ]);

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const totalRevenue = appointments
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.appointmentFee || 0), 0);

  return {
    totalDoctors,
    totalPatients,
    totalAppointments,
    totalRevenue,
    pendingAppointments,
    completedAppointments,
  };
};

export const getAppointmentStatusDistributionRepository = async (
  startDate: Date
): Promise<AppointmentStatusDistribution> => {
  const appointments = await Appointment.find({ date: { $gte: startDate.toISOString() } });

  return {
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };
};

export const getPaymentStatusDistributionRepository = async (
  startDate: Date
): Promise<PaymentStatusDistribution> => {
  const appointments = await Appointment.find({ date: { $gte: startDate.toISOString() } });

  return {
    pending: appointments.filter((a) => a.paymentStatus === 'pending').length,
    paid: appointments.filter((a) => a.paymentStatus === 'paid').length,
    refunded: appointments.filter((a) => a.paymentStatus === 'refunded').length,
  };
};

export const getTimeSeriesDataRepository = async (startDate: Date): Promise<TimeSeriesData[]> => {
  const stats = await Appointment.aggregate([
    {
      $match: {
        date: { $gte: startDate.toISOString() },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: { $dateFromString: { dateString: '$date' } } } },
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
    date: stat._id,
    appointments: stat.appointments,
    revenue: stat.revenue,
  }));
};

export const getTopDoctorsRepository = async (
  startDate: Date,
  limit: number
): Promise<TopDoctor[]> => {
  const topDoctors = await Appointment.aggregate([
    {
      $match: {
        date: { $gte: startDate.toISOString() },
      },
    },
    {
      $group: {
        _id: '$doctorId',
        appointments: { $sum: 1 },
      },
    },
    {
      $sort: { appointments: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctor',
      },
    },
    {
      $unwind: '$doctor',
    },
    {
      $project: {
        doctorId: { $toString: '$_id' },
        name: '$doctor.name',
        appointments: 1,
      },
    },
  ]);

  return topDoctors;
};

export const getTopPatientsRepository = async (
  startDate: Date,
  limit: number
): Promise<TopPatient[]> => {
  const topPatients = await Appointment.aggregate([
    {
      $match: {
        date: { $gte: startDate.toISOString() },
      },
    },
    {
      $group: {
        _id: '$patientId',
        appointments: { $sum: 1 },
      },
    },
    {
      $sort: { appointments: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'patient',
      },
    },
    {
      $unwind: {
        path: '$patient',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        patientId: { $toString: '$_id' },
        name: '$patient.name',
        appointments: 1,
      },
    },
  ]);

  return topPatients;
};