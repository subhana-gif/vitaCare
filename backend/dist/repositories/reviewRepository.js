"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
class ReviewRepository {
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }
    async create(reviewData) {
        const review = new this.reviewModel(reviewData);
        return await review.save();
    }
    async findByDoctorAndUser(doctorId, userId) {
        return await this.reviewModel.findOne({ doctorId, userId }).exec();
    }
    async findByDoctor(doctorId, page, limit) {
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
    async countByDoctor(doctorId) {
        return await this.reviewModel.countDocuments({ doctorId }).exec();
    }
    async getAverageRating(doctorId) {
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
exports.ReviewRepository = ReviewRepository;
