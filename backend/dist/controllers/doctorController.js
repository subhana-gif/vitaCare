"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
class DoctorController {
    constructor(doctorService, notificationService) {
        this.doctorService = doctorService;
        this.notificationService = notificationService;
    }
    async registerDoctor(req, res) {
        try {
            const { name, email, password } = req.body;
            const doctorData = {
                name,
                email,
                password,
                status: "pending"
            };
            const doctor = await this.doctorService.registerDoctor(doctorData);
            res.status(201).json({
                message: "Doctor registered successfully. Please log in.",
                doctor
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Error registering doctor",
                error: error instanceof Error ? error.message : "Unknown error"
            });
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
            res.status(200).json({ message: "Login successful", doctor: result.doctor, token: result.token });
        }
        catch (error) {
            res.status(500).json({ message: "Error logging in", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }
    async getAllDoctors(req, res) {
        try {
            const doctors = await this.doctorService.getAllDoctors();
            res.json({ doctors });
        }
        catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
        }
    }
    async getDoctorById(req, res) {
        try {
            const id = req.query.doctorId;
            if (!id) {
                res.status(400).json({ message: "Doctor ID is required" });
                return;
            }
            const doctor = await this.doctorService.getDoctorById(id);
            doctor ? res.status(200).json({ data: doctor }) : res.status(404).json({ message: "Doctor not found" });
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching doctor", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }
    async getDoctorsById(req, res) {
        try {
            const { id } = req.params;
            if (!id || id.length !== 24) {
                res.status(400).json({ message: "Invalid doctor ID format" });
                return;
            }
            const doctor = await this.doctorService.getDoctorById(id);
            if (!doctor) {
                res.status(404).json({ message: "Doctor not found" });
                return;
            }
            res.status(200).json({ doctor });
        }
        catch (error) {
            console.error("Error fetching doctor details:", error);
            res.status(500).json({ message: "Failed to fetch doctor details", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }
    async updateDoctor(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const doctor = await this.doctorService.updateDoctor(id, updateData);
            doctor ? res.status(200).json({ message: "Doctor updated successfully", doctor }) :
                res.status(404).json({ message: "Doctor not found" });
        }
        catch (error) {
            res.status(500).json({ message: "Error updating doctor", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }
    async deleteDoctor(req, res) {
        try {
            const { id } = req.params;
            await this.doctorService.deleteDoctor(id);
            res.status(200).json({ message: "Doctor deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting doctor", error: error instanceof Error ? error.message : "Unknown error" });
        }
    }
    async approveDoctor(req, res) {
        try {
            const { doctorId, status } = req.body;
            const updatedDoctor = await this.doctorService.updateDoctorStatus(doctorId, status);
            if (!updatedDoctor) {
                res.status(404).json({ message: "Doctor not found" });
                return;
            }
            res.status(200).json({ message: `Doctor status updated to ${status}` });
        }
        catch (error) {
            res.status(500).json({
                message: "Error approving/rejecting doctor",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            await this.doctorService.sendResetLink(email);
            res.status(200).json({ message: "Password reset link sent successfully." });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to send password reset link." });
        }
    }
    async resetPassword(req, res) {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ error: "Token and new password are required" });
            return;
        }
        try {
            await this.doctorService.resetPassword(token, newPassword);
            res.status(200).json({ message: "Password reset successful" });
        }
        catch (error) {
            res.status(500).json({ error: "Failed to reset password" });
        }
    }
    async addDoctor(req, res) {
        try {
            const doctorData = req.body;
            const doctor = await this.doctorService.addDoctor(doctorData);
            res.status(201).json({
                message: "Doctor added successfully. Password setup email has been sent.",
                doctor
            });
        }
        catch (error) {
            res.status(500).json({
                message: "Error adding doctor",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
    async setPassword(req, res) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                res.status(400).json({ message: "Token and password are required" });
                return;
            }
            await this.doctorService.setPassword(token, password);
            res.status(200).json({ message: "Password set successfully" });
        }
        catch (error) {
            res.status(500).json({
                message: "Error setting password",
                error: error instanceof Error ? error.message : "An unknown error occurred"
            });
        }
    }
    async getDoctorStatus(req, res) {
        try {
            const doctorId = req.user?.id; // Ensure req.user is defined in your middleware
            if (!doctorId) {
                res.status(401).json({ message: "Unauthorized access" });
                return;
            }
            const status = await this.doctorService.getDoctorStatus(doctorId);
            res.status(200).json({ status });
        }
        catch (error) {
            res.status(500).json({ message: error || "Error fetching doctor status" });
        }
    }
}
exports.DoctorController = DoctorController;
