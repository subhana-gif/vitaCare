import { PaginationResult } from '../../types/pagination';
import { IReview } from './IReview';

export interface IReviewService {
  createReview(reviewData: {
    doctorId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<IReview>;
  getDoctorReviews(
    doctorId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<IReview>>;
  getDoctorRating(doctorId: string): Promise<{ averageRating: number; totalReviews: number }>;
}