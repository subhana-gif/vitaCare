import express, { Request, Response } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import PaymentController from "../controllers/paymentController";
import PaymentService from "../services/paymentService";
import PaymentRepository from "../repositories/paymentRepository";
import {AppointmentRepository} from "../repositories/appointmentRepository";

const router = express.Router();

// Initialize dependencies
const paymentRepository = new PaymentRepository();
const appointmentRepository = new AppointmentRepository();
const paymentService = new PaymentService(paymentRepository, appointmentRepository);
const paymentController = new PaymentController(paymentService);

router.post("/payonline", verifyToken(["user"]), async (req: Request, res: Response) => {
  await paymentController.createOrder(req, res);
});

router.post("/verify", async (req: Request, res: Response) => {
  await paymentController.verifyPayment(req, res);
});

router.post("/refund", verifyToken(["doctor"]), async (req: Request, res: Response) => {
  await paymentController.processRefund(req, res);
});

export default router;