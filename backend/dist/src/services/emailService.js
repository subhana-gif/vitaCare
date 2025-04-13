"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    sendPasswordResetEmail(email, resetLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: process.env.EMAIL || "default@example.com",
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
                const result = yield this.transporter.sendMail(mailOptions);
                console.log("Email sent successfully:", result.messageId);
                return true;
            }
            catch (error) {
                console.error("Email sending failed:", error);
                throw error;
            }
        });
    }
    sendOTPEmail(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: process.env.EMAIL || "default@example.com",
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
                const result = yield this.transporter.sendMail(mailOptions);
                console.log("OTP Email sent successfully:", result.messageId);
                return true;
            }
            catch (error) {
                console.error("OTP Email sending failed:", error);
                throw error;
            }
        });
    }
    sendAppointmentConfirmationEmail(userEmail, appointmentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const { patientName, doctorName, date, time, appointmentFee, location } = appointmentDetails;
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const mailOptions = {
                from: process.env.EMAIL,
                to: userEmail,
                subject: "Appointment Confirmation - VitaCare",
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4a90e2;">Appointment Confirmed</h1>
          </div>
          
          <p>Dear ${patientName},</p>
          
          <p>Your appointment has been successfully booked with <strong>Dr. ${doctorName}</strong>.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Appointment Details:</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Fee:</strong> ₹${appointmentFee.toFixed(2)}</p>
            ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
          </div>
          
          <p>Please arrive 15 minutes before your scheduled appointment time.</p>
          
          <p>If you need to reschedule or cancel your appointment, please do so at least 24 hours in advance.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; font-size: 14px; color: #666;">
            <p>Thank you for choosing VitaCare for your healthcare needs.</p>
            <p>For any questions or assistance, please contact us at ${process.env.CONTACT_EMAIL || 'support@vitacare.com'}</p>
          </div>
        </div>
      `,
            };
            try {
                const result = yield this.transporter.sendMail(mailOptions);
                console.log("Appointment confirmation email sent successfully:", result.messageId);
                return true;
            }
            catch (error) {
                console.error("Appointment confirmation email sending failed:", error);
                throw error;
            }
        });
    }
    sendAppointmentReminderEmail(userEmail, appointmentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const { patientName, doctorName, date, time, location, timeframe } = appointmentDetails;
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const mailOptions = {
                from: process.env.EMAIL,
                to: userEmail,
                subject: `Appointment Reminder: ${timeframe} Until Your Appointment - VitaCare`,
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4a90e2;">Appointment Reminder</h1>
          </div>
          
          <p>Dear ${patientName},</p>
          
          <p>This is a friendly reminder that your appointment with <strong>Dr. ${doctorName}</strong> is scheduled in <strong>${timeframe}</strong>.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Appointment Details:</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time}</p>
            ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">Important Reminders:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Please arrive 15 minutes before your scheduled time</li>
              <li>Bring any relevant medical records or test results</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; font-size: 14px; color: #666;">
            <p>Thank you for choosing VitaCare for your healthcare needs.</p>
            <p>For any questions or assistance, please contact us at ${process.env.CONTACT_EMAIL || 'support@vitacare.com'}</p>
          </div>
        </div>
      `,
            };
            try {
                const result = yield this.transporter.sendMail(mailOptions);
                console.log(`Appointment reminder email (${timeframe}) sent successfully:`, result.messageId);
                return true;
            }
            catch (error) {
                console.error(`Appointment reminder email (${timeframe}) sending failed:`, error);
                throw error;
            }
        });
    }
}
exports.default = new EmailService();
