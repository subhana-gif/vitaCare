"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctorController_1 = require("../controllers/doctorController");
const DoctorService_1 = require("../services/DoctorService");
const doctorRepository_1 = require("../repositories/doctorRepository");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const router = express_1.default.Router();
const doctorRepository = new doctorRepository_1.DoctorRepository();
const doctorService = new DoctorService_1.DoctorService(doctorRepository);
const doctorController = new doctorController_1.DoctorController(doctorService);
// Public routes
router.post("/login", (0, validationMiddleware_1.validate)(), doctorController.loginDoctor.bind(doctorController));
router.post("/signup", doctorController.registerDoctor.bind(doctorController));
router.post("/forgot-password", doctorController.forgotPassword.bind(doctorController));
router.post("/resetPassword", doctorController.resetPassword.bind(doctorController));
router.post("/set-password", doctorController.setPassword.bind(doctorController));
router.get("/", doctorController.getAllDoctors.bind(doctorController));
// Protected routes
router.post("/add", (0, validationMiddleware_1.validate)(), (0, authMiddleware_1.verifyToken)(["admin"]), uploadMiddleware_1.uploadAndSaveToS3, doctorController.addDoctor.bind(doctorController));
router.get("/profile", (0, authMiddleware_1.verifyToken)(["user", "doctor", "admin"]), doctorController.getDoctorProfile.bind(doctorController));
router.get("/:id", (0, authMiddleware_1.verifyToken)(["admin", "doctor", "user"]), doctorController.getDoctorById.bind(doctorController));
router.put("/:id", (0, authMiddleware_1.verifyToken)(["admin", "doctor"]), uploadMiddleware_1.uploadAndSaveToS3, doctorController.updateDoctor.bind(doctorController));
router.delete("/:id", (0, authMiddleware_1.verifyToken)(["admin"]), doctorController.deleteDoctor.bind(doctorController));
router.post("/approval", (0, authMiddleware_1.verifyToken)(["admin"]), doctorController.approveDoctor.bind(doctorController));
exports.default = router;
