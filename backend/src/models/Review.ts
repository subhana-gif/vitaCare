import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  doctorId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
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

export default mongoose.model<IReview>('Review', reviewSchema);