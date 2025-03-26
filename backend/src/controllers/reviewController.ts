import { Request, Response, NextFunction } from 'express';
import { IReviewService } from '../interfaces/IReviewService';
import { IUserService } from '../interfaces/IUserservice';

export class ReviewController {
  constructor(
    private readonly reviewService: IReviewService,
    private readonly userService: IUserService
  ) {}

  createReview = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
      const { doctorId, rating, comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return 
      }

      const user = await this.userService.getUserProfile(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return
      }

      const review = await this.reviewService.createReview({
        doctorId,
        userId,
        userName: user.name,
        rating,
        comment,
      });

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  };

  getDoctorReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { doctorId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.reviewService.getDoctorReviews(doctorId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getDoctorRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { doctorId } = req.params;
      const rating = await this.reviewService.getDoctorRating(doctorId);
      res.json(rating);
    } catch (error) {
      next(error);
    }
  };
}