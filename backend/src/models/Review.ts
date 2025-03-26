import mongoose, { Schema, Document } from 'mongoose';
import { IReview } from '../interfaces/IReview';

const reviewSchema = new Schema<IReview>(
  {
    doctorId: {
      type: String,
      ref: 'Doctor',
      required: true,
    },
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Add index for faster queries
reviewSchema.index({ doctorId: 1, createdAt: -1 });

export default mongoose.model<IReview & Document>('Review', reviewSchema);