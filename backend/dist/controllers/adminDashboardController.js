"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopPatients = exports.getTopDoctors = exports.getTimeSeriesData = exports.getPaymentStatusDistribution = exports.getAppointmentStatusDistribution = exports.getSummaryStats = void 0;
const adminDashboardService_1 = require("../services/adminDashboardService");
const errorHandler_1 = require("../utils/errorHandler");
const getSummaryStats = async (req, res) => {
    try {
        const { range } = req.query;
        const stats = await (0, adminDashboardService_1.getSummaryStatsService)(range);
        res.status(200).json(stats);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch summary statistics');
    }
};
exports.getSummaryStats = getSummaryStats;
const getAppointmentStatusDistribution = async (req, res) => {
    try {
        const { range } = req.query;
        const distribution = await (0, adminDashboardService_1.getAppointmentStatusDistributionService)(range);
        res.status(200).json(distribution);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch appointment status distribution');
    }
};
exports.getAppointmentStatusDistribution = getAppointmentStatusDistribution;
const getPaymentStatusDistribution = async (req, res) => {
    try {
        const { range } = req.query;
        const distribution = await (0, adminDashboardService_1.getPaymentStatusDistributionService)(range);
        res.status(200).json(distribution);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch payment status distribution');
    }
};
exports.getPaymentStatusDistribution = getPaymentStatusDistribution;
const getTimeSeriesData = async (req, res) => {
    try {
        const { range } = req.query;
        const data = await (0, adminDashboardService_1.getTimeSeriesDataService)(range);
        res.status(200).json(data);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch time series data');
    }
};
exports.getTimeSeriesData = getTimeSeriesData;
const getTopDoctors = async (req, res) => {
    try {
        const { range, limit } = req.query;
        const topDoctors = await (0, adminDashboardService_1.getTopDoctorsService)(range, parseInt(limit) || 5);
        res.status(200).json(topDoctors);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch top doctors');
    }
};
exports.getTopDoctors = getTopDoctors;
const getTopPatients = async (req, res) => {
    try {
        const { range, limit } = req.query;
        const topPatients = await (0, adminDashboardService_1.getTopPatientsService)(range, parseInt(limit) || 5);
        res.status(200).json(topPatients);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch top patients');
    }
};
exports.getTopPatients = getTopPatients;
