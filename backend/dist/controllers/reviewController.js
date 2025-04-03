"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
class ReviewController {
    constructor(reviewService, userService) {
        this.reviewService = reviewService;
        this.userService = userService;
        this.createReview = async (req, res, next) => {
            try {
                const { doctorId, rating, comment } = req.body;
                const userId = req.user?.id;
                if (!userId) {
                    res.status(401).json({ message: 'User not authenticated' });
                    return;
                }
                const user = await this.userService.getUserProfile(userId);
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    return;
                }
                const review = await this.reviewService.createReview({
                    doctorId,
                    userId,
                    userName: user.name,
                    rating,
                    comment,
                });
                res.status(201).json(review);
            }
            catch (error) {
                next(error);
            }
        };
        this.getDoctorReviews = async (req, res, next) => {
            try {
                const { doctorId } = req.params;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const result = await this.reviewService.getDoctorReviews(doctorId, page, limit);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getDoctorRating = async (req, res, next) => {
            try {
                const { doctorId } = req.params;
                const rating = await this.reviewService.getDoctorRating(doctorId);
                res.json(rating);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ReviewController = ReviewController;
