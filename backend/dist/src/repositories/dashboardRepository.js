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
exports.getTodayAppointmentsRepository = exports.getMonthlyStatsRepository = exports.getPopularTimeSlotsRepository = exports.getPaymentSummaryRepository = exports.getAppointmentSummaryRepository = void 0;
const appointment_1 = __importDefault(require("../models/appointment"));
const getAppointmentSummaryRepository = (doctorId, startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const appointments = yield appointment_1.default.find({
        doctorId,
        date: { $gte: startDate.toISOString() },
    });
    return {
        pending: appointments.filter((a) => a.status === 'pending').length,
        confirmed: appointments.filter((a) => a.status === 'confirmed').length,
        cancelled: appointments.filter((a) => a.status === 'cancelled').length,
        completed: appointments.filter((a) => a.status === 'completed').length,
    };
});
exports.getAppointmentSummaryRepository = getAppointmentSummaryRepository;
const getPaymentSummaryRepository = (doctorId, startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const appointments = yield appointment_1.default.find({
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
});
exports.getPaymentSummaryRepository = getPaymentSummaryRepository;
const getPopularTimeSlotsRepository = (doctorId, startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const timeSlots = yield appointment_1.default.aggregate([
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
});
exports.getPopularTimeSlotsRepository = getPopularTimeSlotsRepository;
const getMonthlyStatsRepository = (doctorId, startDate) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield appointment_1.default.aggregate([
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
});
exports.getMonthlyStatsRepository = getMonthlyStatsRepository;
const getTodayAppointmentsRepository = (doctorId) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date().toISOString().split('T')[0];
    return yield appointment_1.default.find({
        doctorId,
        date: today,
    }).populate('patientId', 'name email');
});
exports.getTodayAppointmentsRepository = getTodayAppointmentsRepository;
