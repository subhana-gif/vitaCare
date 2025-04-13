"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const speciality_1 = __importDefault(require("../models/speciality"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const HttpStatus_1 = require("../enums/HttpStatus");
class DoctorController {
    constructor(doctorService) {
        this.doctorService = doctorService;
    }
    handleError(res, error, defaultMessage) {
        const message = error instanceof Error ? error.message : defaultMessage;
        res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message });
    }
    registerDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { name, email, password } = req.body;
                const doctor = yield this.doctorService.registerDoctor({ name, email, password });
                // Create the notification and get the result
                const notification = yield notificationService_1.default.createNotification({
                    recipientId: ((_a = doctor._id) === null || _a === void 0 ? void 0 : _a.toString()) || "",
                    recipientRole: "admin",
                    message: `New doctor ${doctor.name} signed up!`,
                });
                // Emit the notification to the admin room
                (_b = req.io) === null || _b === void 0 ? void 0 : _b.to("adminRoom").emit("newNotification", {
                    message: notification.message,
                    createdAt: notification.createdAt || new Date(), // Use current date if not provided
                    seen: false, // Default to false if not provided
                });
                res.status(HttpStatus_1.HttpStatus.CREATED).json({ message: HttpStatus_1.HttpMessage.OK });
            }
            catch (error) {
                this.handleError(res, error, "Error registering doctor");
            }
        });
    }
    loginDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const result = yield this.doctorService.loginDoctor(email, password);
                if (!result) {
                    res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: HttpStatus_1.HttpMessage.UNAUTHORIZED });
                    return;
                }
                res.status(HttpStatus_1.HttpStatus.OK).json({
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
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this.doctorService.sendResetLink(email);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: HttpStatus_1.HttpMessage.OK });
            }
            catch (error) {
                this.handleError(res, error, "Error sending reset link");
            }
        });
    }
    getAllDoctors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctors = yield this.doctorService.getAllDoctors();
                res.json({ doctors });
            }
            catch (error) {
                this.handleError(res, error, "Error fetching doctors");
            }
        });
    }
    getDoctorById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id || req.query.doctorId;
                if (!id) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                    return;
                }
                const doctor = yield this.doctorService.getDoctorById(id.toString());
                if (!doctor) {
                    res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
                res.status(HttpStatus_1.HttpStatus.OK).json({ doctor });
            }
            catch (error) {
                this.handleError(res, error, "Error fetching doctor");
            }
        });
    }
    addDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctorData = req.body;
                const speciality = yield speciality_1.default.findOne({ name: doctorData.speciality });
                if (!speciality) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                    return;
                }
                if (req.file) {
                    const uploadedFile = yield (0, uploadMiddleware_1.uploadFileToS3)(req.file);
                    doctorData.imageUrl = uploadedFile.fileUrl;
                }
                const doctor = yield this.doctorService.addDoctor(doctorData);
                res.status(HttpStatus_1.HttpStatus.CREATED).json({
                    message: "Doctor added successfully",
                    doctor,
                });
            }
            catch (error) {
                this.handleError(res, error, "Error adding doctor");
            }
        });
    }
    updateDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updateData = req.body;
                if (req.file) {
                    const uploadedFile = yield (0, uploadMiddleware_1.uploadFileToS3)(req.file);
                    updateData.imageUrl = uploadedFile.fileUrl;
                }
                if (updateData.speciality) {
                    const speciality = yield speciality_1.default.findOne({ name: updateData.speciality });
                    if (!speciality) {
                        res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                        return;
                    }
                    updateData.speciality = speciality.name;
                }
                const doctor = yield this.doctorService.updateDoctor(id, updateData);
                if (!doctor) {
                    res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
                res.status(HttpStatus_1.HttpStatus.OK).json(doctor);
            }
            catch (error) {
                this.handleError(res, error, "Error updating doctor");
            }
        });
    }
    getDoctorProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Get doctor ID from the token (more secure than query params)
                const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!doctorId) {
                    res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: HttpStatus_1.HttpMessage.BAD_REQUEST });
                    return;
                }
                const doctor = yield this.doctorService.getDoctorById(doctorId);
                if (!doctor) {
                    res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
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
                res.status(HttpStatus_1.HttpStatus.OK).json(doctorProfile);
            }
            catch (error) {
                this.handleError(res, error, "Error fetching doctor profile");
            }
        });
    }
    deleteDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield this.doctorService.deleteDoctor(id);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: HttpStatus_1.HttpMessage.OK });
            }
            catch (error) {
                this.handleError(res, error, "Error deleting doctor");
            }
        });
    }
    approveDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { doctorId, status } = req.body;
                const doctor = yield this.doctorService.approveDoctor(doctorId, status);
                if (!doctor) {
                    res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: HttpStatus_1.HttpMessage.NOT_FOUND });
                    return;
                }
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: `Doctor ${status}`, doctor });
            }
            catch (error) {
                this.handleError(res, error, "Error approving doctor");
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPassword } = req.body;
                yield this.doctorService.resetPassword(token, newPassword);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: HttpStatus_1.HttpMessage.OK });
            }
            catch (error) {
                this.handleError(res, error, "Error resetting password");
            }
        });
    }
    setPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, password } = req.body;
                console.log("token for setpassword:", token);
                yield this.doctorService.setPassword(token, password);
                res.status(HttpStatus_1.HttpStatus.OK).json({ message: HttpStatus_1.HttpMessage.OK });
            }
            catch (error) {
                console.log("error setting password:", error);
                this.handleError(res, error, "Error setting password");
            }
        });
    }
}
exports.DoctorController = DoctorController;
