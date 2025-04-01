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
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      minlength: [3, "Doctor name must be at least 3 characters long"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      default: null,
      validate: {
        validator: function (value: string | null) {
          return value === null || value.length >= 6;
        },
        message: "Password must be at least 6 characters long",
      },
    },
    speciality: {
      type: String,
      required: [true, "Speciality is required"],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, "Degree is required"],
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    appointmentFee: {
      type: Number,
      required: [true, "Appointment fee is required"],
      min: [1, "Appointment fee must be a positive number"],
    },
    about: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      validate: {
        validator: function (value: string) {
          return value === "" || /^(https?:\/\/.*\.(?:png|jpg|jpeg|svg|webp))$/.test(value);
        },
        message: "Invalid image URL",
      },
    },
    available: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Virtual field for slots
doctorSchema.virtual("slots", {
  ref: "Slot",
  localField: "_id",
  foreignField: "doctorId",
});

// Password hashing middleware
doctorSchema.pre<IDoctor>("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Doctor: Model<IDoctor> = mongoose.model<IDoctor>("Doctor", doctorSchema);

export default Doctor;
