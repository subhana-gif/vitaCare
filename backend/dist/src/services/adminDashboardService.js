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
exports.getTopPatientsService = exports.getTopDoctorsService = exports.getTimeSeriesDataService = exports.getPaymentStatusDistributionService = exports.getAppointmentStatusDistributionService = exports.getSummaryStatsService = void 0;
const adminDashboardRepository_1 = require("../repositories/adminDashboardRepository");
const dateRangeHelper_1 = require("../utils/dateRangeHelper");
const getSummaryStatsService = (range) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return yield (0, adminDashboardRepository_1.getSummaryStatsRepository)(startDate);
});
exports.getSummaryStatsService = getSummaryStatsService;
const getAppointmentStatusDistributionService = (range) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return yield (0, adminDashboardRepository_1.getAppointmentStatusDistributionRepository)(startDate);
});
exports.getAppointmentStatusDistributionService = getAppointmentStatusDistributionService;
const getPaymentStatusDistributionService = (range) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return yield (0, adminDashboardRepository_1.getPaymentStatusDistributionRepository)(startDate);
});
exports.getPaymentStatusDistributionService = getPaymentStatusDistributionService;
const getTimeSeriesDataService = (range) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return yield (0, adminDashboardRepository_1.getTimeSeriesDataRepository)(startDate);
});
exports.getTimeSeriesDataService = getTimeSeriesDataService;
const getTopDoctorsService = (range, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return yield (0, adminDashboardRepository_1.getTopDoctorsRepository)(startDate, limit);
});
exports.getTopDoctorsService = getTopDoctorsService;
const getTopPatientsService = (range, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return yield (0, adminDashboardRepository_1.getTopPatientsRepository)(startDate, limit);
});
exports.getTopPatientsService = getTopPatientsService;
