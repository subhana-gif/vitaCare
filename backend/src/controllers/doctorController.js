const Doctor = require("../models/doctors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// 📌 Send Invitation Email with Link to Set Password
exports.addDoctor = async (req, res) => {
  try {
    const { name, email, speciality, degree, experience, address, about, available,appointmentfee } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newDoctor = new Doctor({ name, email, speciality, degree, experience, address, about, image, available, appointmentfee: Number(appointmentfee), });
    await newDoctor.save();

    const frontendUrl = "http://localhost:5173/doctors/set-password?email=" + encodeURIComponent(email);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
    });
    console.log("Attempting to send email to:", email);

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Set Your Password for Doctor's Portal",
      html: `<p>Dear ${name},</p>
             <p>You have been added as a doctor in our system. Please click the link below to set your password:</p>
             <a href="${frontendUrl}" style="display:inline-block;padding:10px 15px;color:#fff;background:#007bff;text-decoration:none;border-radius:5px;">Set Password</a>`,
    };
    console.log("Mail options:", mailOptions);

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(201).json({ message: "Doctor added, email failed", emailError: err.message });
      }
      res.status(201).json({ message: "Doctor added successfully, check your email to set password" });
    });

  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// 📌 Set Password Endpoint
exports.setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log("🔹 New Hashed Password (before saving):", hashedPassword);

    doctor.password = hashedPassword;
    await doctor.save();

    // Fetch updated doctor from database
    const updatedDoctor = await Doctor.findOne({ email });
    console.log("🔹 Stored Password After Update:", updatedDoctor.password);

    res.status(200).json({ message: "Password set successfully. You can now log in." });

  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// 📌 Doctor Login Endpoint
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });

    if (!doctor || !doctor.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }


    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: doctor._id, email: doctor.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ message: "Login successful", token, doctor });

  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};