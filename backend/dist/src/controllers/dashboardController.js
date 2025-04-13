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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayAppointments = exports.getMonthlyStats = exports.getPopularTimeSlots = exports.getPaymentSummary = exports.getAppointmentSummary = void 0;
const dashboardService_1 = require("../services/dashboardService");
const errorHandler_1 = require("../utils/errorHandler");
const HttpStatus_1 = require("../enums/HttpStatus");
const getAppointmentSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId } = req.params;
        const { range } = req.query;
        const summary = yield (0, dashboardService_1.getAppointmentSummaryService)(doctorId, range);
        res.status(HttpStatus_1.HttpStatus.OK).json(summary);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch appointment summary');
    }
});
exports.getAppointmentSummary = getAppointmentSummary;
const getPaymentSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId } = req.params;
        const { range } = req.query;
        const summary = yield (0, dashboardService_1.getPaymentSummaryService)(doctorId, range);
        res.status(HttpStatus_1.HttpStatus.OK).json(summary);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch payment summary');
    }
});
exports.getPaymentSummary = getPaymentSummary;
const getPopularTimeSlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId } = req.params;
        const { range } = req.query;
        const timeSlots = yield (0, dashboardService_1.getPopularTimeSlotsService)(doctorId, range);
        res.status(HttpStatus_1.HttpStatus.OK).json(timeSlots);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch popular time slots');
    }
});
exports.getPopularTimeSlots = getPopularTimeSlots;
const getMonthlyStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId } = req.params;
        const { months } = req.query;
        const stats = yield (0, dashboardService_1.getMonthlyStatsService)(doctorId, parseInt(months));
        res.status(HttpStatus_1.HttpStatus.OK).json(stats);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch monthly stats');
    }
});
exports.getMonthlyStats = getMonthlyStats;
const getTodayAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId } = req.params;
        const appointments = yield (0, dashboardService_1.getTodayAppointmentsService)(doctorId);
        res.status(HttpStatus_1.HttpStatus.OK).json(appointments);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch today\'s appointments');
    }
});
exports.getTodayAppointments = getTodayAppointments;
