const express = require("express");
const Appointment = require("../models/appointments");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all appointments
router.get("/", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error });
  }
});

// Book an appointment
router.post("/", authMiddleware, async (req, res) => {
  const { patientName, doctorName, date, time } = req.body;

  try {
    const appointment = new Appointment({ patientName, doctorName, date, time });
    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment", error });
  }
});

module.exports = router;
