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
exports.ReviewController = void 0;
const HttpStatus_1 = require("../enums/HttpStatus");
class ReviewController {
    constructor(reviewService, userService) {
        this.reviewService = reviewService;
        this.userService = userService;
        this.createReview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { doctorId, rating, comment } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(HttpStatus_1.HttpStatus.CREATED).json({ message: HttpStatus_1.HttpMessage.CREATED });
                    return;
                }
                const user = yield this.userService.getUserProfile(userId);
                if (!user) {
                    res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
                const review = yield this.reviewService.createReview({
                    doctorId,
                    userId,
                    userName: user.name,
                    rating,
                    comment,
                });
                res.status(HttpStatus_1.HttpStatus.CREATED).json(review);
            }
            catch (error) {
                next(error);
            }
        });
        this.getDoctorReviews = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { doctorId } = req.params;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const result = yield this.reviewService.getDoctorReviews(doctorId, page, limit);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.getDoctorRating = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { doctorId } = req.params;
                const { averageRating, totalReviews } = yield this.reviewService.getDoctorRating(doctorId);
                res.json({ averageRating, totalReviews });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ReviewController = ReviewController;
