import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  slotId:string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  appointmentFee: number;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _id: string; // Update the type of _id to string
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true 
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
      index: true 
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)']
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)']
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
      index: true 
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    appointmentFee: {
      type: Number,
      required: [true, 'Appointment fee is required'],
      min: [1, 'Appointment fee must be a positive number']
    },
    paymentId: {
      type: String,
      default: null
    }
  },
  { 
    timestamps: true,
    autoIndex: false 
  }
);

appointmentSchema.index(
  { doctorId: 1, date: 1, time: 1 }, 
  { 
    unique: true,
    name: 'timeslot_unique_idx'
  }
);


appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, status: 1 });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);