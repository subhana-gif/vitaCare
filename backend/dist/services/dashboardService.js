"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayAppointmentsService = exports.getMonthlyStatsService = exports.getPopularTimeSlotsService = exports.getPaymentSummaryService = exports.getAppointmentSummaryService = void 0;
const dashboardRepository_1 = require("../repositories/dashboardRepository");
const dateRangeHelper_1 = require("../utils/dateRangeHelper");
const mongoose_1 = require("mongoose");
const getAppointmentSummaryService = async (doctorId, range) => {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return await (0, dashboardRepository_1.getAppointmentSummaryRepository)(new mongoose_1.Types.ObjectId(doctorId), startDate);
};
exports.getAppointmentSummaryService = getAppointmentSummaryService;
const getPaymentSummaryService = async (doctorId, range) => {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return await (0, dashboardRepository_1.getPaymentSummaryRepository)(new mongoose_1.Types.ObjectId(doctorId), startDate);
};
exports.getPaymentSummaryService = getPaymentSummaryService;
const getPopularTimeSlotsService = async (doctorId, range) => {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return await (0, dashboardRepository_1.getPopularTimeSlotsRepository)(new mongoose_1.Types.ObjectId(doctorId), startDate);
};
exports.getPopularTimeSlotsService = getPopularTimeSlotsService;
const getMonthlyStatsService = async (doctorId, months) => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    return await (0, dashboardRepository_1.getMonthlyStatsRepository)(new mongoose_1.Types.ObjectId(doctorId), startDate);
};
exports.getMonthlyStatsService = getMonthlyStatsService;
const getTodayAppointmentsService = async (doctorId) => {
    return await (0, dashboardRepository_1.getTodayAppointmentsRepository)(new mongoose_1.Types.ObjectId(doctorId));
};
exports.getTodayAppointmentsService = getTodayAppointmentsService;
