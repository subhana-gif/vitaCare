import express from "express";
import { AppointmentController } from "../controllers/appointmentController";
import { DoctorService } from "../services/DoctorService"; // ✅ Import doctorService
import { verifyToken } from "../middleware/authMiddleware";
import { DoctorRepository } from "../repositories/doctorRepository";

const router = express.Router();

const doctorRepository = new DoctorRepository()
const doctorService = new DoctorService(doctorRepository); 
const appointmentController = new AppointmentController(doctorService);

router.post("/book", verifyToken(["user"]), appointmentController.bookAppointment.bind(appointmentController));
router.put("/:appointmentId/status", verifyToken(["doctor"]), appointmentController.updateStatus);
router.get("/doctor", verifyToken(["doctor","user"]), appointmentController.getDoctorAppointments);
router.get("/patient/:patientId", verifyToken(["user"]), appointmentController.getPatientAppointments);
router.get("/patient", verifyToken(["user", "admin"]), appointmentController.getAppointments.bind(appointmentController));
router.delete('/:id', verifyToken(['user']), appointmentController.cancelAppointment.bind(appointmentController));
router.get("/", verifyToken(["admin"]), appointmentController.getAllAppointments.bind(appointmentController));


export default router;

