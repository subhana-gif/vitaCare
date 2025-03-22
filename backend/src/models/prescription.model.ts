import mongoose, { Schema, Document } from 'mongoose';

interface IMedicine {
  name: string;
  dosage: string;
  duration: string;
  timing: string;
}

export interface IPrescription extends Document {
  appointmentId: mongoose.Types.ObjectId;
  medicines: IMedicine[];
  diagnosis: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const medicineSchema = new Schema<IMedicine>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
  timing: { type: String, required: true }
});

const prescriptionSchema = new Schema<IPrescription>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    medicines: [medicineSchema],
    diagnosis: { type: String, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IPrescription>('Prescription', prescriptionSchema);