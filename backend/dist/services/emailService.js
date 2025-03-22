"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    async sendPasswordResetEmail(email, resetLink) {
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset - VitaCare",
            html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        };
        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", result.messageId);
            return true;
        }
        catch (error) {
            console.error("Email sending failed:", error);
            throw error;
        }
    }
    async sendOTPEmail(email, otp) {
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "OTP for Verification - VitaCare",
            html: `
        <h1>OTP Verification</h1>
        <p>Your OTP for verification is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        };
        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log("OTP Email sent successfully:", result.messageId);
            return true;
        }
        catch (error) {
            console.error("OTP Email sending failed:", error);
            throw error;
        }
    }
}
exports.default = new EmailService();
