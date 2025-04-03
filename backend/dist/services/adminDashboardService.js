"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopPatientsService = exports.getTopDoctorsService = exports.getTimeSeriesDataService = exports.getPaymentStatusDistributionService = exports.getAppointmentStatusDistributionService = exports.getSummaryStatsService = void 0;
const adminDashboardRepository_1 = require("../repositories/adminDashboardRepository");
const dateRangeHelper_1 = require("../utils/dateRangeHelper");
const getSummaryStatsService = async (range) => {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return await (0, adminDashboardRepository_1.getSummaryStatsRepository)(startDate);
};
exports.getSummaryStatsService = getSummaryStatsService;
const getAppointmentStatusDistributionService = async (range) => {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return await (0, adminDashboardRepository_1.getAppointmentStatusDistributionRepository)(startDate);
};
exports.getAppointmentStatusDistributionService = getAppointmentStatusDistributionService;
const getPaymentStatusDistributionService = async (range) => {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return await (0, adminDashboardRepository_1.getPaymentStatusDistributionRepository)(startDate);
};
exports.getPaymentStatusDistributionService = getPaymentStatusDistributionService;
const getTimeSeriesDataService = async (range) => {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return await (0, adminDashboardRepository_1.getTimeSeriesDataRepository)(startDate);
};
exports.getTimeSeriesDataService = getTimeSeriesDataService;
const getTopDoctorsService = async (range, limit) => {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return await (0, adminDashboardRepository_1.getTopDoctorsRepository)(startDate, limit);
};
exports.getTopDoctorsService = getTopDoctorsService;
const getTopPatientsService = async (range, limit) => {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return await (0, adminDashboardRepository_1.getTopPatientsRepository)(startDate, limit);
};
exports.getTopPatientsService = getTopPatientsService;
