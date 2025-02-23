const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctors");
const mongoose = require("mongoose");
const upload = require("../middleware/uploadMiddleware");
const { addDoctor, setPassword, loginDoctor } = require("../controllers/doctorController");

router.post("/add", upload.single("image"), addDoctor);
router.post("/set-password", setPassword);
router.post("/login", loginDoctor);

router.get("/", async (req, res) => {  
  try {
    let { page = 1, limit = 9, search = "", specialization = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } }
      ];
    }

    if (specialization) {
      query.specialization = specialization;
    }

    const totalDoctors = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      doctors,
      currentPage: page,
      totalPages: Math.ceil(totalDoctors / limit),
    });

  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/doctor", async (req, res) => {
  try {
    const doctor = await Doctor.findOne(); // Assuming one doctor profile
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor details" });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Doctor ID" });
    }

    const updateFields = { ...req.body };

    if (req.file) {
      updateFields.image = `/uploads/${req.file.filename}`;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
