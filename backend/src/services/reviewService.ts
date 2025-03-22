import { IReviewRepository } from '../repositories/reviewRepository';

export interface IReviewService {
  createReview(reviewData: any): Promise<any>;
  getDoctorReviews(doctorId: string, page: number, limit: number): Promise<{
    reviews: any[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
    };
  }>;
  getDoctorRating(doctorId: string): Promise<{
    averageRating: number;
    totalReviews: number;
  }>;
}

export class ReviewService implements IReviewService {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async createReview(reviewData: any): Promise<any> {
    const existingReview = await this.reviewRepository.findReviewByDoctorAndUser(
      reviewData.doctorId,
      reviewData.userId
    );

    if (existingReview) {
      throw new Error('You have already reviewed this doctor');
    }

    return await this.reviewRepository.createReview(reviewData);
  }

  async getDoctorReviews(doctorId: string, page: number, limit: number): Promise<{
    reviews: any[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
    };
  }> {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.reviewRepository.findReviewsByDoctor(doctorId, skip, limit),
      this.reviewRepository.countReviewsByDoctor(doctorId)
    ]);

    return {
      reviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    };
  }

  async getDoctorRating(doctorId: string): Promise<{
    averageRating: number;
    totalReviews: number;
  }> {
    return await this.reviewRepository.getAverageRating(doctorId);
  }
}