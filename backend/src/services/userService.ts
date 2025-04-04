import { IUserRepository } from "../interfaces/user/IUserRepository";
import UserRepository from "../repositories/userRepository";
import bcrypt from "bcrypt";
import TokenService from "../services/tokenService";
import EmailService from "../services/emailService";
import { IUser } from "../interfaces/user/IUser";
import logger from "../utils/logger";
import { IUserService } from "../interfaces/user/IUserservice";

export class UserService implements IUserService {
    constructor(private userRepository: IUserRepository) {}
  async register(userData: IUser) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await this.userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });

    const token = TokenService.generateToken({ id: newUser._id });
    return { token, user: newUser };
  }

  async login(email: string, password: string) {
    logger.info(`Login Attempt: ${email}`);
    const user = await this.userRepository.findByEmail(email);
    if(user?.isBlocked){
      throw new Error("Blocked")
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    if (user.isBlocked) {
      throw new Error("Your account has been blocked. Please contact support.");
    }

    const token = TokenService.generateToken({ id: user._id, role: user.role || "user", name: user.name });
    return { token, user };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("If this email exists in our system, you will receive reset instructions");
    }

    const resetToken = TokenService.generateToken({ email: user.email,role:"user" }, "1h");
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    await EmailService.sendPasswordResetEmail(email, resetLink);
    return { success: true, message: "Reset instructions sent to your email" };
  }



  async resetPassword(token: string, newPassword: string) {
    const decoded = TokenService.verifyToken(token) as unknown as { email: string };
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("hashed:",hashedPassword)
    await this.userRepository.updatePassword(decoded.email, hashedPassword);
    return { success: true, message: "Password reset successful" };
  }

  async sendOTP(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await EmailService.sendOTPEmail(email, otp);
    return { success: true, message: "OTP sent successfully" };
  }

  async verifyOTP(email: string, otp: string) {
    return { success: true, message: "OTP verified successfully" };
  }

  async resendOTP(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await EmailService.sendOTPEmail(email, otp);
    return { success: true, message: "OTP resent successfully" };
  }

  async getAllUsers() {
    return await this.userRepository.findAllUsers();
  }

  async toggleBlockUser(userId: string): Promise<IUser> {
    const user = await this.userRepository.toggleBlockStatus(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getUserProfile(userId: string) {
    return await this.userRepository.findById(userId);
  }

  async updateUserProfile(userId: string, data: Partial<IUser>) {
    return await this.userRepository.updateUser(userId, data);
  }

  async getUserById(id: string): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }
}

export const userServiceInstance = new UserService(UserRepository.getInstance());
