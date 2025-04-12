import { Request, Response, NextFunction } from 'express';
import { IReviewService } from '../interfaces/review/IReviewService';
import { IUserService } from '../interfaces/user/IUserservice';
import { HttpMessage, HttpStatus } from '../enums/HttpStatus';

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
        res.status(HttpStatus.CREATED).json({ message: HttpMessage.CREATED });
        return 
      }

      const user = await this.userService.getUserProfile(userId);
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({ message:HttpMessage.NOT_FOUND });
        return
      }

      const review = await this.reviewService.createReview({
        doctorId,
        userId,
        userName: user.name,
        rating,
        comment,
      });

      res.status(HttpStatus.CREATED).json(review);
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
      const { averageRating, totalReviews } = await this.reviewService.getDoctorRating(doctorId);
      res.json({ averageRating, totalReviews });
    } catch (error) {
      next(error);
    }
  };
}