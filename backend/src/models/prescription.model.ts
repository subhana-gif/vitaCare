import mongoose, { Schema, Document, Model } from "mongoose";

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

const medicineSchema = new Schema<IMedicine>(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, "Dosage is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    timing: {
      type: String,
      required: [true, "Timing is required"],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const prescriptionSchema = new Schema<IPrescription, IPrescriptionModel>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment reference is required"],
      unique: true,
    },
    medicines: {
      type: [medicineSchema],
      validate: {
        validator: (medicines: IMedicine[]) => medicines.length > 0,
        message: "At least one medicine is required",
      },
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      minlength: [5, "Diagnosis must be at least 5 characters long"],
      trim: true,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// 🔍 Static method to find a prescription by `appointmentId`
prescriptionSchema.statics.findByAppointmentId = function (appointmentId: string) {
  return this.findOne({ appointmentId });
};

// ⚡ Ensuring `appointmentId` is unique for faster lookups
prescriptionSchema.index({ appointmentId: 1 }, { unique: true });

// ✅ Middleware: Ensures `appointmentId` exists before saving
prescriptionSchema.pre<IPrescription>("save", async function (next) {
  const Appointment = mongoose.model("Appointment");
  const exists = await Appointment.exists({ _id: this.appointmentId });

  if (!exists) {
    return next(new Error(`Appointment with ID ${this.appointmentId} does not exist`));
  }
  next();
});

const Prescription = mongoose.model<IPrescription, IPrescriptionModel>(
  "Prescription",
  prescriptionSchema
);

export default Prescription;
