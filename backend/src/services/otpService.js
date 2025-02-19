const nodemailer = require("nodemailer");
const crypto = require("crypto");

class OtpService {
  constructor() {
    this.otpStore = new Map();
  }

  generateOtp(email) {
    const otp = crypto.randomInt(100000, 999999).toString();
    this.otpStore.set(email, otp);
    return otp;
  }

  async sendOtp(email) {
    const otp = this.generateOtp(email);
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    return { message: "OTP sent successfully" };
  }

  verifyOtp(email, userOtp) {
    const storedOtp = this.otpStore.get(email);
    if (storedOtp === userOtp) {
      this.otpStore.delete(email);
      return true;
    }
    return false;
  }
}

module.exports = new OtpService();
