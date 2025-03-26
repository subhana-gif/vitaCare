import { Model } from 'mongoose';
import { IReview, IReviewDocument } from '../interfaces/IReview';
import { IReviewRepository } from '../interfaces/IReviewRepository';
import { PaginationResult } from '../types/pagination';

export class ReviewRepository implements IReviewRepository {
  constructor(private readonly reviewModel: Model<IReviewDocument>) {}

  async create(reviewData: Partial<IReview>): Promise<IReview> {
    const review = new this.reviewModel(reviewData);
    return await review.save();
  }

  async findByDoctorAndUser(doctorId: string, userId: string): Promise<IReview | null> {
    return await this.reviewModel.findOne({ doctorId, userId }).exec();
  }

  async findByDoctor(
    doctorId: string,
    page: number,
    limit: number
  ): Promise<PaginationResult<IReview>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.reviewModel
        .find({ doctorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.countByDoctor(doctorId),
    ]);

    return {
      data,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  }

  async countByDoctor(doctorId: string): Promise<number> {
    return await this.reviewModel.countDocuments({ doctorId }).exec();
  }

  async getAverageRating(
    doctorId: string
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await this.reviewModel
      .aggregate([
        { $match: { doctorId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ])
      .exec();

    return result[0] || { averageRating: 0, totalReviews: 0 };
  }
}