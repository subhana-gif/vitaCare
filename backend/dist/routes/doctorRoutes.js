"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const doctorController_1 = require("../controllers/doctorController");
const DoctorService_1 = require("../services/DoctorService");
const notificationService_1 = require("../services/notificationService");
const doctorRepository_1 = require("../repositories/doctorRepository");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const doctorRepository = new doctorRepository_1.DoctorRepository();
const notificationService = new notificationService_1.NotificationService();
const doctorService = new DoctorService_1.DoctorService(doctorRepository, notificationService);
const doctorController = new doctorController_1.DoctorController(doctorService, notificationService);
// Ensure uploads directory exists
const uploadsDir = (0, path_1.join)(__dirname, "..", "..", "uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (_req, file, callback) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(null, false);
            return callback(new Error("Invalid file type. Only JPEG, JPG, and PNG are allowed."));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
}).single("image");
// Routes
router.post("/signup", doctorController.registerDoctor.bind(doctorController));
router.post("/add", upload, doctorController.addDoctor.bind(doctorController));
router.post("/login", doctorController.loginDoctor.bind(doctorController));
router.get("/", doctorController.getAllDoctors.bind(doctorController));
router.get("/profile", doctorController.getDoctorById.bind(doctorController));
router.get("/:id", doctorController.getDoctorsById.bind(doctorController));
router.put("/:id", doctorController.updateDoctor.bind(doctorController));
router.delete("/:id", doctorController.deleteDoctor.bind(doctorController));
router.post("/approval", doctorController.approveDoctor.bind(doctorController));
router.post('/forgot-password', doctorController.forgotPassword.bind(doctorController));
router.post("/resetPassword", doctorController.resetPassword.bind(doctorController));
router.post("/set-password", doctorController.setPassword.bind(doctorController));
router.post("/set-password", doctorController.setPassword.bind(doctorController));
router.get("/status", authMiddleware_1.authenticateToken, doctorController.getDoctorStatus.bind(doctorController));
exports.default = router;
