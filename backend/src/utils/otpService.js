const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

// Store OTPs temporarily (For production, use Redis or DB)
const otpStore = {};

const generateOTP = (email) => {
  const otp = otpGenerator.generate(6, { 
    digits: true, 
    lowerCaseAlphabets: false, 
    upperCaseAlphabets: false, 
    specialChars: false   
  });
  otpStore[email] = otp;
  return otp;
};

const sendOTPEmail = async (email, otp) => {
  try {

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP for Verification",
      text: `Your OTP for registration is: ${otp}. It is valid for 5 minutes.`,
    };

    const result = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
};

const verifyOTP = (email, otp) => {
  return otpStore[email] === otp;
};

module.exports = { generateOTP, sendOTPEmail, verifyOTP, otpStore };
