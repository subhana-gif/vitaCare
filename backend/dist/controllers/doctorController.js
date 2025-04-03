"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const speciality_1 = __importDefault(require("../models/speciality"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
class DoctorController {
    constructor(doctorService) {
        this.doctorService = doctorService;
    }
    handleError(res, error, defaultMessage) {
        const message = error instanceof Error ? error.message : defaultMessage;
        res.status(500).json({ message });
    }
    async registerDoctor(req, res) {
        try {
            const { name, email, password } = req.body;
            const doctor = await this.doctorService.registerDoctor({ name, email, password });
            await notificationService_1.default.createNotification({
                recipientId: doctor._id?.toString() || "",
                recipientRole: "admin",
                message: `New doctor ${doctor.name} signed up!`,
            });
            req.io.to("adminRoom").emit("newNotification");
            res.status(201).json({ message: "Doctor registered successfully", doctor });
        }
        catch (error) {
            this.handleError(res, error, "Error registering doctor");
        }
    }
    async loginDoctor(req, res) {
        try {
            const { email, password } = req.body;
            const result = await this.doctorService.loginDoctor(email, password);
            if (!result) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }
            res.status(200).json({
                message: "Login successful",
                doctor: {
                    _id: result.doctor._id,
                    name: result.doctor.name,
                    email: result.doctor.email,
                    status: result.doctor.status,
                },
                token: result.token,
            });
        }
        catch (error) {
            this.handleError(res, error, "Error logging in");
        }
    }
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            await this.doctorService.sendResetLink(email);
            res.status(200).json({ message: "Password reset link sent successfully" });
        }
        catch (error) {
            this.handleError(res, error, "Error sending reset link");
        }
    }
    async getAllDoctors(req, res) {
        try {
            const doctors = await this.doctorService.getAllDoctors();
            res.json({ doctors });
        }
        catch (error) {
            this.handleError(res, error, "Error fetching doctors");
        }
    }
    async getDoctorById(req, res) {
        try {
            const id = req.params.id || req.query.doctorId;
            if (!id) {
                res.status(400).json({ message: "Doctor ID is required" });
                return;
            }
            const doctor = await this.doctorService.getDoctorById(id.toString());
            if (!doctor) {
                res.status(404).json({ message: "Doctor not found" });
                return;
            }
            res.status(200).json({ doctor });
        }
        catch (error) {
            this.handleError(res, error, "Error fetching doctor");
        }
    }
    async addDoctor(req, res) {
        try {
            const doctorData = req.body;
            const speciality = await speciality_1.default.findOne({ name: doctorData.speciality });
            if (!speciality) {
                res.status(400).json({ message: "Speciality not found" });
                return;
            }
            if (req.file) {
                const uploadedFile = await (0, uploadMiddleware_1.uploadFileToS3)(req.file);
                doctorData.imageUrl = uploadedFile.fileUrl;
            }
            const doctor = await this.doctorService.addDoctor(doctorData);
            res.status(201).json({
                message: "Doctor added successfully",
                doctor,
            });
        }
        catch (error) {
            this.handleError(res, error, "Error adding doctor");
        }
    }
    async updateDoctor(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            if (req.file) {
                const uploadedFile = await (0, uploadMiddleware_1.uploadFileToS3)(req.file);
                updateData.imageUrl = uploadedFile.fileUrl;
            }
            if (updateData.speciality) {
                const speciality = await speciality_1.default.findOne({ name: updateData.speciality });
                if (!speciality) {
                    res.status(400).json({ message: "Invalid speciality" });
                    return;
                }
                updateData.speciality = speciality.name;
            }
            const doctor = await this.doctorService.updateDoctor(id, updateData);
            if (!doctor) {
                res.status(404).json({ message: "Doctor not found" });
                return;
            }
            res.status(200).json({ message: "Doctor updated successfully", doctor });
        }
        catch (error) {
            this.handleError(res, error, "Error updating doctor");
        }
    }
    async getDoctorProfile(req, res) {
        try {
            // Get doctor ID from the token (more secure than query params)
            const doctorId = req.user.id;
            if (!doctorId) {
                res.status(400).json({ message: "Doctor ID not found in token" });
                return;
            }
            const doctor = await this.doctorService.getDoctorById(doctorId);
            if (!doctor) {
                res.status(404).json({ message: "Doctor not found" });
                return;
            }
            // Return only necessary doctor data (don't expose sensitive info)
            const doctorProfile = {
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                speciality: doctor.speciality,
                degree: doctor.degree,
                experience: doctor.experience,
                address: doctor.address,
                about: doctor.about,
                imageUrl: doctor.imageUrl,
                available: doctor.available,
                status: doctor.status,
            };
            res.status(200).json(doctorProfile); // Changed to return directly
        }
        catch (error) {
            this.handleError(res, error, "Error fetching doctor profile");
        }
    }
    async deleteDoctor(req, res) {
        try {
            const { id } = req.params;
            await this.doctorService.deleteDoctor(id);
            res.status(200).json({ message: "Doctor deleted successfully" });
        }
        catch (error) {
            this.handleError(res, error, "Error deleting doctor");
        }
    }
    async approveDoctor(req, res) {
        try {
            const { doctorId, status } = req.body;
            const doctor = await this.doctorService.approveDoctor(doctorId, status);
            if (!doctor) {
                res.status(404).json({ message: "Doctor not found" });
                return;
            }
            res.status(200).json({ message: `Doctor ${status}`, doctor });
        }
        catch (error) {
            this.handleError(res, error, "Error approving doctor");
        }
    }
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            await this.doctorService.resetPassword(token, newPassword);
            res.status(200).json({ message: "Password reset successful" });
        }
        catch (error) {
            this.handleError(res, error, "Error resetting password");
        }
    }
    async setPassword(req, res) {
        try {
            const { token, password } = req.body;
            await this.doctorService.setPassword(token, password);
            res.status(200).json({ message: "Password set successfully" });
        }
        catch (error) {
            this.handleError(res, error, "Error setting password");
        }
    }
}
exports.DoctorController = DoctorController;
