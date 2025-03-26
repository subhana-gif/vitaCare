import { IReviewService } from '../interfaces/review/IReviewService';
import { IReviewRepository } from '../interfaces/review/IReviewRepository';
import { IReview } from '../interfaces/review/IReview';
import { PaginationResult } from '../types/pagination';

export class ReviewService implements IReviewService {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async createReview(reviewData: {
    doctorId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<IReview> {
    return await this.reviewRepository.create(reviewData);
  }

  async getDoctorReviews(
    doctorId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<IReview>> {
    return await this.reviewRepository.findByDoctor(doctorId, page, limit);
  }

  async getDoctorRating(
    doctorId: string
  ): Promise<{ averageRating: number; totalReviews: number }> {
    return await this.reviewRepository.getAverageRating(doctorId);
  }
}