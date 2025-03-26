import { IUser } from "./IUser";

export interface IUserService {
  register(userData: IUser): Promise<{ token: string; user: IUser }>;
  login(email: string, password: string): Promise<{ token: string; user: IUser }>;
  forgotPassword(email: string): Promise<{ success: boolean; message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }>;
  sendOTP(email: string): Promise<{ success: boolean; message: string }>;
  toggleBlockUser(userId: string): Promise<IUser>;
  getUserById(id: string): Promise<IUser | null>;
  verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }>;
  resendOTP(email: string): Promise<{ success: boolean; message: string }>;
  getAllUsers(): Promise<IUser[]>;
  toggleBlockUser(userId: string): Promise<IUser>;
  getUserProfile(userId: string): Promise<IUser | null>;
  updateUserProfile(userId: string, data: Partial<IUser>): Promise<IUser | null>;
}