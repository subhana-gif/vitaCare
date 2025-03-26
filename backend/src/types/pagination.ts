export interface PaginationResult<T> {
    data: T[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      limit: number;
    };
  }