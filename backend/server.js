const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const path = require("path")
require("dotenv").config();
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const doctors = require("./src/routes/doctorRoutes")
const appointments = require("./src/routes/appointmentRoutes")


const app = express();

// ✅ Enable CORS for frontend (http://localhost:5173)
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctors);
app.use("/api/appointments", appointments);


// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
