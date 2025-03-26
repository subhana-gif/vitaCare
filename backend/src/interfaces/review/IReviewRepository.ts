import { PaginationResult } from '../../types/pagination';
import { IReview } from './IReview';

export interface IReviewRepository {
  create(reviewData: Partial<IReview>): Promise<IReview>;
  findByDoctorAndUser(doctorId: string, userId: string): Promise<IReview | null>;
  findByDoctor(
    doctorId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<IReview>>;
  countByDoctor(doctorId: string): Promise<number>;
  getAverageRating(doctorId: string): Promise<{ averageRating: number; totalReviews: number }>;
}