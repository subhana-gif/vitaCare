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
exports.getTopPatients = exports.getTopDoctors = exports.getTimeSeriesData = exports.getPaymentStatusDistribution = exports.getAppointmentStatusDistribution = exports.getSummaryStats = void 0;
const adminDashboardService_1 = require("../services/adminDashboardService");
const errorHandler_1 = require("../utils/errorHandler");
const HttpStatus_1 = require("../enums/HttpStatus");
const getSummaryStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { range } = req.query;
        const stats = yield (0, adminDashboardService_1.getSummaryStatsService)(range);
        res.status(HttpStatus_1.HttpStatus.OK).json(stats);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch summary statistics');
    }
});
exports.getSummaryStats = getSummaryStats;
const getAppointmentStatusDistribution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { range } = req.query;
        const distribution = yield (0, adminDashboardService_1.getAppointmentStatusDistributionService)(range);
        res.status(HttpStatus_1.HttpStatus.OK).json(distribution);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch appointment status distribution');
    }
});
exports.getAppointmentStatusDistribution = getAppointmentStatusDistribution;
const getPaymentStatusDistribution = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { range } = req.query;
        const distribution = yield (0, adminDashboardService_1.getPaymentStatusDistributionService)(range);
        res.status(HttpStatus_1.HttpStatus.OK).json(distribution);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch payment status distribution');
    }
});
exports.getPaymentStatusDistribution = getPaymentStatusDistribution;
const getTimeSeriesData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { range } = req.query;
        const data = yield (0, adminDashboardService_1.getTimeSeriesDataService)(range);
        res.status(HttpStatus_1.HttpStatus.OK).json(data);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch time series data');
    }
});
exports.getTimeSeriesData = getTimeSeriesData;
const getTopDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { range, limit } = req.query;
        const topDoctors = yield (0, adminDashboardService_1.getTopDoctorsService)(range, parseInt(limit) || 5);
        res.status(HttpStatus_1.HttpStatus.OK).json(topDoctors);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch top doctors');
    }
});
exports.getTopDoctors = getTopDoctors;
const getTopPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { range, limit } = req.query;
        const topPatients = yield (0, adminDashboardService_1.getTopPatientsService)(range, parseInt(limit) || 5);
        res.status(HttpStatus_1.HttpStatus.OK).json(topPatients);
    }
    catch (error) {
        (0, errorHandler_1.handleErrorResponse)(res, error, 'Failed to fetch top patients');
    }
});
exports.getTopPatients = getTopPatients;
