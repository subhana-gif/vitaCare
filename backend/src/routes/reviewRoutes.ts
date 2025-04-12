import express from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import { ReviewController } from '../controllers/reviewController';
import { ReviewService } from '../services/reviewService';
import { ReviewRepository } from '../repositories/reviewRepository';
import Review from '../models/Review';
import { UserService } from '../services/userService';
import UserRepository from '../repositories/userRepository';

const router = express.Router();

const reviewRepository = new ReviewRepository(Review);
const userRepository = UserRepository.getInstance()
const reviewService = new ReviewService(reviewRepository);
const userService = new UserService(userRepository)
const reviewController = new ReviewController(reviewService,userService);

router.post('/', verifyToken(['user']), reviewController.createReview);
router.get('/:doctorId', verifyToken(['doctor', 'user']), reviewController.getDoctorReviews);
router.get('/:doctorId/rating', reviewController.getDoctorRating);

export default router;