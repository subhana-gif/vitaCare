import express from 'express';
import { reviewController } from '../controllers/reviewController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

// Create a new review
router.post('/', verifyToken(["user"]), async (req, res, next) => {
    try {
        await reviewController.createReview(req, res);
    } catch (error) {
        next(error);
    }
});

// Get reviews for a specific doctor with pagination
router.get('/:doctorId', verifyToken(["doctor","user"]), reviewController.getDoctorReviews);

// Get average rating and total reviews for a doctor
router.get('/:doctorId/rating', verifyToken(["user","doctor"]), reviewController.getDoctorRating);

export default router;