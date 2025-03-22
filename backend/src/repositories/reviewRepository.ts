import { Model } from 'mongoose';
import Review from '../models/Review';

export interface IReviewRepository {
  createReview(reviewData: any): Promise<any>;
  findReviewByDoctorAndUser(doctorId: string, userId: string): Promise<any>;
  findReviewsByDoctor(doctorId: string, skip: number, limit: number): Promise<any[]>;
  countReviewsByDoctor(doctorId: string): Promise<number>;
  getAverageRating(doctorId: string): Promise<any>;
}

export class ReviewRepository implements IReviewRepository {
  constructor(private readonly reviewModel: Model<any> = Review) {}

  async createReview(reviewData: any): Promise<any> {
    const review = new this.reviewModel(reviewData);
    return await review.save();
  }

  async findReviewByDoctorAndUser(doctorId: string, userId: string): Promise<any> {
    return await this.reviewModel.findOne({ doctorId, userId });
  }

  async findReviewsByDoctor(doctorId: string, skip: number, limit: number): Promise<any[]> {
    return await this.reviewModel
      .find({ doctorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name");
  }

  async countReviewsByDoctor(doctorId: string): Promise<number> {
    return await this.reviewModel.countDocuments({ doctorId });
  }

  async getAverageRating(doctorId: string): Promise<any> {
    const result = await this.reviewModel.aggregate([
      { $match: { doctorId: doctorId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    return result[0] || { averageRating: 0, totalReviews: 0 };
  }
}