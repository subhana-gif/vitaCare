import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs"; // For password hashing
import { IUserDocument } from "../interfaces/user/IUser";

const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],  // Email format validation
    },
    password: { type: String, required: true, minlength: 6 },  // Added password length validation
    phone: { 
      type: String, 
      unique: true, 
      sparse: true,  // Optional, no need to be unique if some users don't have phone numbers
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

// Password hashing before saving the user
UserSchema.pre<IUserDocument>("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Indexing fields for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

// User model
const User = mongoose.model<IUserDocument>("User", UserSchema);

export default User;
