"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayAppointments = exports.getMonthlyStats = exports.getPopularTimeSlots = exports.getPaymentSummary = exports.getAppointmentSummary = void 0;
const dashboardService_1 = require("../services/dashboardService");
const errorHandler_1 = require("../utils/errorHandler");
const getAppointmentSummary = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { range } = req.query;
        const summary = await (0, dashboardService_1.getAppointmentSummaryService)(doctorId, range);
        res.status(200).json(summary);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch appointment summary');
    }
};
exports.getAppointmentSummary = getAppointmentSummary;
const getPaymentSummary = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { range } = req.query;
        const summary = await (0, dashboardService_1.getPaymentSummaryService)(doctorId, range);
        res.status(200).json(summary);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch payment summary');
    }
};
exports.getPaymentSummary = getPaymentSummary;
const getPopularTimeSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { range } = req.query;
        const timeSlots = await (0, dashboardService_1.getPopularTimeSlotsService)(doctorId, range);
        res.status(200).json(timeSlots);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch popular time slots');
    }
};
exports.getPopularTimeSlots = getPopularTimeSlots;
const getMonthlyStats = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { months } = req.query;
        const stats = await (0, dashboardService_1.getMonthlyStatsService)(doctorId, parseInt(months));
        res.status(200).json(stats);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch monthly stats');
    }
};
exports.getMonthlyStats = getMonthlyStats;
const getTodayAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await (0, dashboardService_1.getTodayAppointmentsService)(doctorId);
        res.status(200).json(appointments);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch today\'s appointments');
    }
};
exports.getTodayAppointments = getTodayAppointments;
