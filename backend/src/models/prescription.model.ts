import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicine {
  name: string;
  dosage: string;
  duration: string;
  timing: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  appointmentId: mongoose.Types.ObjectId;
  medicines: IMedicine[];
  diagnosis: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescriptionModel extends Model<IPrescription> {
  findByAppointmentId(appointmentId: string): Promise<IPrescription | null>;
}

const medicineSchema = new Schema<IMedicine>({
  name: { 
    type: String, 
    required: [true, 'Medicine name is required'] 
  },
  dosage: { 
    type: String, 
    required: [true, 'Dosage is required'] 
  },
  duration: { 
    type: String, 
    required: [true, 'Duration is required'] 
  },
  timing: { 
    type: String, 
    required: [true, 'Timing is required'],
  },
  instructions: { 
    type: String 
  }
}, { _id: false });

const prescriptionSchema = new Schema<IPrescription, IPrescriptionModel>(
  {
    appointmentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Appointment', 
      required: [true, 'Appointment reference is required'],
      unique: true 
    },
    medicines: {
      type: [medicineSchema],
      validate: {
        validator: (medicines: IMedicine[]) => medicines.length > 0,
        message: 'At least one medicine is required'
      }
    },
    diagnosis: { 
      type: String, 
      required: [true, 'Diagnosis is required'],
      minlength: [4, 'Diagnosis must be at least 5 characters long']
    },
    notes: { 
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  { 
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
      }
    },
    toObject: {
      virtuals: true
    }
  }
);

prescriptionSchema.statics.findByAppointmentId = function(appointmentId: string) {
  return this.findOne({ appointmentId });
};

prescriptionSchema.index({ appointmentId: 1 }, { unique: true });

const Prescription = mongoose.model<IPrescription, IPrescriptionModel>(
  'Prescription', 
  prescriptionSchema
);

export default Prescription;