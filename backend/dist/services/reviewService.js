"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
class ReviewService {
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async createReview(reviewData) {
        return await this.reviewRepository.create(reviewData);
    }
    async getDoctorReviews(doctorId, page, limit) {
        return await this.reviewRepository.findByDoctor(doctorId, page, limit);
    }
    async getDoctorRating(doctorId) {
        return await this.reviewRepository.getAverageRating(doctorId);
    }
}
exports.ReviewService = ReviewService;
