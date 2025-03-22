import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
import http from "http";
import { Server } from "socket.io";
import socketHandler from "./src/socket/socket";


import adminRoutes from "./src/routes/adminRoutes";
import authRoutes from "./src/routes/userRoutes";
import doctorRoutes from "./src/routes/doctorRoutes"
import appointmentRoutes from "./src/routes/appointmentRoutes"
import paymentRoutes from "./src/routes/paymentRoutes"
import chatRoutes from "./src/routes/chatRoutes"
import slotRoutes from "./src/routes/slotRoutes"
import reviews from "./src/routes/reviewRoutes"
import prescription from "./src/routes/prescription.routes"


dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// ✅ Handle Preflight Requests (OPTIONS)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", authRoutes);
app.use("/api/doctor",doctorRoutes)
app.use("/api/appointments",appointmentRoutes)
app.use("/api/payment",paymentRoutes)
app.use("/api/chat",chatRoutes)
app.use("/api/slots",slotRoutes)
app.use("/api/reviews",reviews)
app.use("/api/prescriptions",prescription)

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
socketHandler(io);

// Start the server after DB connection
const PORT = process.env.PORT || 5001;
connectDB()
  .then(() => {
    server.listen(PORT, () => {  // ✅ Use `server.listen()` instead of `app.listen()`
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

export default app;
