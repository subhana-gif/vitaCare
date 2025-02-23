const AuthService = require("../services/AuthService");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateOTP, sendOTPEmail, verifyOTP, otpStore } = require("../utils/otpService");

// ✅ Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP
    const otp = generateOTP(email);

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!verifyOTP(email, otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.signup = async (req, res) => {

  try {

    if (!req.body) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered" });
  } catch (error) {
    console.error("Signup Error:", error.stack);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.resendotp = async (req, res) => {
  const { email } = req.body;

  if (!email || !otpStore[email]) {
    return res.status(400).json({ message: "No OTP found for this email" });
  }

  try {
    const otp = otpStore[email]; // Retrieve stored OTP
    await sendOTPEmail(email, otp); // Resend OTP
    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("❌ Error resending OTP:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await AuthService.login(email, password);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};
