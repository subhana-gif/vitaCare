import { Document } from 'mongoose';

export interface IReview extends Document {
  doctorId: string;
  userId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {}