"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
class ReviewRepository {
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }
    create(reviewData) {
        return __awaiter(this, void 0, void 0, function* () {
            const review = new this.reviewModel(reviewData);
            return yield review.save();
        });
    }
    findByDoctorAndUser(doctorId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.reviewModel.findOne({ doctorId, userId }).exec();
        });
    }
    findByDoctor(doctorId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const [data, total] = yield Promise.all([
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
        });
    }
    countByDoctor(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.reviewModel.countDocuments({ doctorId }).exec();
        });
    }
    getAverageRating(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.reviewModel
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
        });
    }
}
exports.ReviewRepository = ReviewRepository;
