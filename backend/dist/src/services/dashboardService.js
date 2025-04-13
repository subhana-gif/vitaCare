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
exports.getTodayAppointmentsService = exports.getMonthlyStatsService = exports.getPopularTimeSlotsService = exports.getPaymentSummaryService = exports.getAppointmentSummaryService = void 0;
const dashboardRepository_1 = require("../repositories/dashboardRepository");
const dateRangeHelper_1 = require("../utils/dateRangeHelper");
const mongoose_1 = require("mongoose");
const getAppointmentSummaryService = (doctorId, range) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return yield (0, dashboardRepository_1.getAppointmentSummaryRepository)(new mongoose_1.Types.ObjectId(doctorId), startDate);
});
exports.getAppointmentSummaryService = getAppointmentSummaryService;
const getPaymentSummaryService = (doctorId, range) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return yield (0, dashboardRepository_1.getPaymentSummaryRepository)(new mongoose_1.Types.ObjectId(doctorId), startDate);
});
exports.getPaymentSummaryService = getPaymentSummaryService;
const getPopularTimeSlotsService = (doctorId, range) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = dateRangeHelper_1.DateRangeHelper.getStartDate(range);
    return yield (0, dashboardRepository_1.getPopularTimeSlotsRepository)(new mongoose_1.Types.ObjectId(doctorId), startDate);
});
exports.getPopularTimeSlotsService = getPopularTimeSlotsService;
const getMonthlyStatsService = (doctorId, months) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    return yield (0, dashboardRepository_1.getMonthlyStatsRepository)(new mongoose_1.Types.ObjectId(doctorId), startDate);
});
exports.getMonthlyStatsService = getMonthlyStatsService;
const getTodayAppointmentsService = (doctorId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, dashboardRepository_1.getTodayAppointmentsRepository)(new mongoose_1.Types.ObjectId(doctorId));
});
exports.getTodayAppointmentsService = getTodayAppointmentsService;
