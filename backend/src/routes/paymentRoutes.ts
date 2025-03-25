import express, { Request, Response } from "express";
import PaymentController from "../controllers/paymentController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/payonline", verifyToken(["user"]),async (req: Request, res: Response) => {
    await PaymentController.createOrder(req, res);
});

router.post("/verify", async (req: Request, res: Response) => {
    await PaymentController.verifyPayment(req, res);
});

router.post("/refund", verifyToken(["doctor"]), async (req: Request, res: Response) => {
    await PaymentController.processRefund(req, res);
});

export default router;
