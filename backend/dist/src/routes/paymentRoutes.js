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
router.post("/payonline", (0, authMiddleware_1.verifyToken)(["user"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentController.createOrder(req, res);
}));
router.post("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentController.verifyPayment(req, res);
}));
router.post("/refund", (0, authMiddleware_1.verifyToken)(["doctor"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield paymentController.processRefund(req, res);
}));
exports.default = router;
