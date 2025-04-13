"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopPatientsRepository = exports.getTopDoctorsRepository = exports.getTimeSeriesDataRepository = exports.getPaymentStatusDistributionRepository = exports.getAppointmentStatusDistributionRepository = exports.getSummaryStatsRepository = void 0;
const appointment_1 = __importDefault(require("../models/appointment"));
const doctors_1 = __importDefault(require("../models/doctors"));
const user_1 = __importDefault(require("../models/user"));
const getSummaryStatsRepository = (startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const [totalDoctors, totalPatients, appointments] = yield Promise.all([
        doctors_1.default.countDocuments(),
        user_1.default.countDocuments(),
        appointment_1.default.find({ date: { $gte: startDate.toISOString() } }),
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
});
exports.getSummaryStatsRepository = getSummaryStatsRepository;
const getAppointmentStatusDistributionRepository = (startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const appointments = yield appointment_1.default.find({ date: { $gte: startDate.toISOString() } });
    return {
        pending: appointments.filter((a) => a.status === 'pending').length,
        confirmed: appointments.filter((a) => a.status === 'confirmed').length,
        cancelled: appointments.filter((a) => a.status === 'cancelled').length,
        completed: appointments.filter((a) => a.status === 'completed').length,
    };
});
exports.getAppointmentStatusDistributionRepository = getAppointmentStatusDistributionRepository;
const getPaymentStatusDistributionRepository = (startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const appointments = yield appointment_1.default.find({ date: { $gte: startDate.toISOString() } });
    return {
        pending: appointments.filter((a) => a.paymentStatus === 'pending').length,
        paid: appointments.filter((a) => a.paymentStatus === 'paid').length,
        refunded: appointments.filter((a) => a.paymentStatus === 'refunded').length,
    };
});
exports.getPaymentStatusDistributionRepository = getPaymentStatusDistributionRepository;
const getTimeSeriesDataRepository = (startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield appointment_1.default.aggregate([
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
});
exports.getTimeSeriesDataRepository = getTimeSeriesDataRepository;
const getTopDoctorsRepository = (startDate, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const topDoctors = yield appointment_1.default.aggregate([
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
});
exports.getTopDoctorsRepository = getTopDoctorsRepository;
const getTopPatientsRepository = (startDate, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const topPatients = yield appointment_1.default.aggregate([
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
});
exports.getTopPatientsRepository = getTopPatientsRepository;
