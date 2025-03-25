export class DateRangeHelper {
    static getStartDate(range: string): Date {
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