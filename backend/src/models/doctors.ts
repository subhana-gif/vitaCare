import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IDoctor extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string | null;
  speciality: string;
  degree: string;
  experience: string;
  address: string;
  appointmentFee: number;
  about: string;
  imageUrl: string;
  available: boolean;
  isBlocked: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean;
}

const doctorSchema: Schema = new Schema(
  {
    name: { type: String,  },
    email: { type: String, unique: true,  },
    password: { type: String, default: null },
    speciality: { type: String, },
    degree: { type: String,},
    experience: { type: String,  },
    address: { type: String,  },
    about: { type: String,  },
    imageUrl: { type: String,  },
    available: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

doctorSchema.virtual("slots", {
  ref: "Slot",
  localField: "_id",
  foreignField: "doctorId",
});

doctorSchema.pre<IDoctor>("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Doctor: Model<IDoctor> = mongoose.model<IDoctor>("Doctor", doctorSchema);

export default Doctor;
