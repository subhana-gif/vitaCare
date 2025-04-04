import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IUserDocument } from "../interfaces/user/IUser";

const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      unique: true,  // This creates an index automatically
      required: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    password: { type: String, required: true, minlength: 6 },
    phone: { 
      type: String, 
      unique: true,  // This creates an index automatically
      sparse: true,
    },
    address: { type: String, trim: true },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other'], 
      default: 'other' 
    },
    dob: { type: Date },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Password hashing middleware
UserSchema.pre<IUserDocument>("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model<IUserDocument>("User", UserSchema);
export default User;