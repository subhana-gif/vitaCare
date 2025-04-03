"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const paymentController_1 = __importDefault(require("../controllers/paymentController"));
const paymentService_1 = __importDefault(require("../services/paymentService"));
const paymentRepository_1 = __importDefault(require("../repositories/paymentRepository"));
const appointmentRepository_1 = require("../repositories/appointmentRepository");
const router = express_1.default.Router();
const paymentRepository = new paymentRepository_1.default();
const appointmentRepository = new appointmentRepository_1.AppointmentRepository();
const paymentService = new paymentService_1.default(paymentRepository, appointmentRepository);
const paymentController = new paymentController_1.default(paymentService);
router.post("/payonline", (0, authMiddleware_1.verifyToken)(["user"]), async (req, res) => {
    await paymentController.createOrder(req, res);
});
router.post("/verify", async (req, res) => {
    await paymentController.verifyPayment(req, res);
});
router.post("/refund", (0, authMiddleware_1.verifyToken)(["doctor"]), async (req, res) => {
    await paymentController.processRefund(req, res);
});
exports.default = router;
