import { Document } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  gender?: string;
  dob?: Date;
  isBlocked?: boolean;
}

export interface IUserDocument extends IUser, Document {
  role: string;
}