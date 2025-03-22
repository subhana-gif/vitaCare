import express from "express";
import { DoctorController } from "../controllers/doctorController";
import { DoctorService } from "../services/DoctorService";
import { DoctorRepository } from "../repositories/doctorRepository";
import { uploadAndSaveToS3 } from "../middleware/uploadMiddleware";
import { verifyToken } from "../middleware/authMiddleware"; 

const router = express.Router();
const doctorRepository = new DoctorRepository();
const doctorService = new DoctorService(doctorRepository);
const doctorController = new DoctorController(doctorService);

// Routes
router.post("/login", doctorController.loginDoctor.bind(doctorController));
router.post("/forgot-password", doctorController.forgotPassword.bind(doctorController));
router.post("/resetPassword", doctorController.resetPassword.bind(doctorController));
router.post("/set-password", doctorController.setPassword.bind(doctorController));
router.post("/signup", doctorController.registerDoctor.bind(doctorController));
router.get("/", doctorController.getAllDoctors.bind(doctorController));

router.post("/add", verifyToken(["admin"]), uploadAndSaveToS3, doctorController.addDoctor.bind(doctorController));
router.get("/profile", verifyToken(["user","doctor","admin"]),doctorController.getDoctorById.bind(doctorController));
router.get("/:id", verifyToken(["admin","doctor","user"]),doctorController.getDoctorsById.bind(doctorController));
router.put("/:id",verifyToken(["admin","doctor"]), uploadAndSaveToS3, doctorController.updateDoctor.bind(doctorController));
router.delete("/:id",verifyToken(["admin"]), doctorController.deleteDoctor.bind(doctorController));
router.post("/approval", verifyToken(["admin"]),doctorController.approveDoctor.bind(doctorController));

export default router;
