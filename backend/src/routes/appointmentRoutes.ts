import express from "express";
import { AppointmentController } from "../controllers/appointmentController";
import { DoctorService } from "../services/DoctorService";
import { verifyToken } from "../middleware/authMiddleware";
import { DoctorRepository } from "../repositories/doctorRepository";
import { AppointmentRepository } from "../repositories/appointmentRepository";
import { AppointmentService } from "../services/appointmentService";
import notificationService from "../services/notificationService";

const router = express.Router();

const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);
const appointmentRepository = new AppointmentRepository();
const appointmentService = new AppointmentService(appointmentRepository, doctorService);
const appointmentController = new AppointmentController(appointmentService,notificationService);

router.post("/book", verifyToken(["user"]), (req, res) => appointmentController.bookAppointment(req, res));
router.put("/:appointmentId/status", verifyToken(["doctor"]), (req, res) => appointmentController.updateStatus(req, res));
router.get("/doctor", verifyToken(["doctor", "user"]), (req, res) => appointmentController.getDoctorAppointments(req, res));
router.get("/patient/:patientId", verifyToken(["user"]), (req, res) => appointmentController.getPatientAppointments(req, res));
router.get("/patient", verifyToken(["user", "admin"]), (req, res) => appointmentController.getAppointments(req, res));
router.delete("/:id", verifyToken(["user"]), (req, res) => appointmentController.cancelAppointment(req, res));
router.get("/", verifyToken(["admin"]), (req, res) => appointmentController.getAllAppointments(req, res));

export default router;