import { Request, Response } from 'express';
import { ReviewService, IReviewService } from '../services/reviewService';
import { ReviewRepository } from '../repositories/reviewRepository';
import UserService from '../services/userService';

const reviewRepository = new ReviewRepository();
const reviewService: IReviewService = new ReviewService(reviewRepository);

export const reviewController = {
  // Create a new review
  createReview: async (req: Request, res: Response) => {
    try {
      const { doctorId, rating, comment } = req.body;
      const userId = req.user?.id;
      console.log("USerid:",userId)
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Fetch user details to get the name
      const user = await UserService.getUserProfile(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const review = await reviewService.createReview({
        doctorId,
        userId,
        userName: user.name,
        rating,
        comment
      });

      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      const message = error instanceof Error ? error.message : 'Error creating review';
      res.status(error instanceof Error && error.message.includes('already reviewed') ? 400 : 500)
        .json({ message });
    }
  },

  getDoctorReviews: async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await reviewService.getDoctorReviews(doctorId, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  },

  getDoctorRating: async (req: Request, res: Response) => {
    try {
      const { doctorId } = req.params;
      const rating = await reviewService.getDoctorRating(doctorId);
      res.json(rating);
    } catch (error) {
      console.error('Error calculating rating:', error);
      res.status(500).json({ message: 'Error calculating rating' });
    }
  }
};