import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
import http from "http";
import { Server } from "socket.io";
import socketHandler from "./src/socket/socket";
import errorHandler from "./src/middleware/errorHandler";

import adminRoutes from "./src/routes/adminRoutes";
import authRoutes from "./src/routes/userRoutes";
import doctorRoutes from "./src/routes/doctorRoutes";
import appointmentRoutes from "./src/routes/appointmentRoutes";
import paymentRoutes from "./src/routes/paymentRoutes";
import chatRoutes from "./src/routes/chatRoutes";
import slotRoutes from "./src/routes/slotRoutes";
import reviews from "./src/routes/reviewRoutes";
import prescription from "./src/routes/prescription.routes";
import dashboard from "./src/routes/dashboard";

// Extend Express Request type to include io
declare module "express-serve-static-core" {
  interface Request {
    io?: Server;
  }
}

dotenv.config();

const app: Application = express();
const allowedOrigins = [
  "https://vitacare.life",
  "https://vita-care-subhana-gifs-projects.vercel.app",
  "http://localhost:5001", // Note: localhost should ideally be for development only
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware with typed configuration
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Optional: Remove or simplify the options handler if cors middleware handles preflight
app.options("*", (req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", allowedOrigins.join(", "));
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  // Optional: Explicitly set path to match client
  path: "/socket.io/",
});

app.use((req: Request, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

socketHandler(io);

app.use("/api/admin", adminRoutes);
app.use("/api/user", authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/reviews", reviews);
app.use("/api/prescriptions", prescription);
app.use("/api/dashboard", dashboard);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

export default { app, io };