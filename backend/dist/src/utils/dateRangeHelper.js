"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangeHelper = void 0;
class DateRangeHelper {
    static getStartDate(range) {
        const now = new Date();
        switch (range) {
            case 'week':
                return new Date(now.setDate(now.getDate() - 7));
            case 'month':
                return new Date(now.setMonth(now.getMonth() - 1));
            case 'year':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            default:
                return new Date(now.setMonth(now.getMonth() - 1));
        }
    }
}
exports.DateRangeHelper = DateRangeHelper;
