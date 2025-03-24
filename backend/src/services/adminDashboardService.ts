import { Types } from 'mongoose';
import Appointment from '../models/appointment';
import Doctor from '../models/doctors';
import Patient from '../models/user';

interface SummaryStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingAppointments: number;
  completedAppointments: number;
}

interface AppointmentStatusDistribution {
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

interface PaymentStatusDistribution {
  pending: number;
  paid: number;
  refunded: number;
}

interface TimeSeriesData {
  date: string;
  appointments: number;
  revenue: number;
}

interface TopDoctor {
  doctorId: Types.ObjectId;
  name: string;
  appointments: number;
}

interface TopPatient {
  patientId: Types.ObjectId;
  name: string;
  appointments: number;
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

export const fetchSummaryStats = async (range: string): Promise<SummaryStats> => {
    const startDate = getStartDate(range);
  
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
  
    const appointments = await Appointment.find({
      date: { $gte: startDate.toISOString() },
    });
  
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
export const fetchAppointmentStatusDistribution = async (
  range: string
): Promise<AppointmentStatusDistribution> => {
  const startDate = getStartDate(range);

  const appointments = await Appointment.find({
    date: { $gte: startDate.toISOString() },
  });

  return {
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };
};

export const fetchPaymentStatusDistribution = async (
  range: string
): Promise<PaymentStatusDistribution> => {
  const startDate = getStartDate(range);

  const appointments = await Appointment.find({
    date: { $gte: startDate.toISOString() },
  });

  return {
    pending: appointments.filter((a) => a.paymentStatus === 'pending').length,
    paid: appointments.filter((a) => a.paymentStatus === 'paid').length,
    refunded: appointments.filter((a) => a.paymentStatus === 'refunded').length,
  };
};

export const fetchTimeSeriesData = async (range: string): Promise<TimeSeriesData[]> => {
  const startDate = getStartDate(range);

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

export const fetchTopDoctors = async (
  range: string,
  limit: number
): Promise<TopDoctor[]> => {
  const startDate = getStartDate(range);

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
        doctorId: '$_id',
        name: '$doctor.name',
        appointments: 1,
      },
    },
  ]);

  return topDoctors;
};

export const fetchTopPatients = async (
    range: string,
    limit: number
  ): Promise<TopPatient[]> => {
    const startDate = getStartDate(range);
    const startDateString = startDate.toISOString().split('T')[0]; // Convert to `YYYY-MM-DD` format
  
    const topPatients = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDateString }, // Compare string dates
        },
      },
      {
        $group: {
          _id: '$patientId', // Group by `patientId`
          appointments: { $sum: 1 }, // Count appointments per patient
        },
      },
      {
        $sort: { appointments: -1 }, // Sort by appointment count (descending)
      },
      {
        $limit: limit, // Limit to top N patients
      },
      {
        $lookup: {
          from: 'users', // Join with the `users` collection
          localField: '_id', // Use the grouped `_id` (which is `patientId`)
          foreignField: '_id', // Match with the `_id` field in the `users` collection
          as: 'patient',
        },
      },
      {
        $unwind: {
          path: '$patient',
          preserveNullAndEmptyArrays: true, // Include documents even if patient is not found
        },
      },
      {
        $project: {
          patientId: '$_id', // Use the grouped `_id` (which is `patientId`)
          name: '$patient.name', // Ensure this matches the field in the `users` collection
          appointments: 1,
        },
      },
    ]).exec();
  
    return topPatients;
  };