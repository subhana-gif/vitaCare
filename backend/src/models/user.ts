import mongoose, { Schema } from "mongoose";
import { IUserDocument } from "../interfaces/IUser";

const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    gender: { type: String },
    dob: { type: Date },
    isBlocked: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    otpAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model<IUserDocument>("User", UserSchema);

export default User;