import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  appointmentFee: number;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'],
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    appointmentFee: {
      type: Number,
      required: [true, 'Appointment fee is required'],
      min: [1, 'Appointment fee must be a positive number'],
    },
    paymentId: {
      type: String,
      default: null,
      validate: {
        validator: function (value: string | null) {
          return value === null || (typeof value === 'string' && value.trim().length > 0);
        },
        message: 'Invalid Payment ID',
      },
    },
  },
  { timestamps: true }
);

// Add index for efficient querying (prevent duplicate appointments)
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
