"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createOrder(req, res) {
        try {
            const { amount } = req.body;
            const order = await this.paymentService.createOrder(amount);
            res.status(201).json(order);
        }
        catch (error) {
            res.status(500).json({ message: error.message || "Failed to create order." });
        }
    }
    async verifyPayment(req, res) {
        try {
            const { order_id, payment_id, signature, appointmentId } = req.body;
            if (!order_id || !payment_id || !signature || !appointmentId) {
                return res.status(400).json({ message: "Invalid request data" });
            }
            const verificationData = { order_id, payment_id, signature, appointmentId };
            const isValid = await this.paymentService.verifyPayment(verificationData);
            if (!isValid) {
                return res.status(400).json({ message: "Payment verification failed" });
            }
            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        }
        catch (error) {
            console.error("Payment Verification Error:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    async processRefund(req, res) {
        try {
            const { appointmentId } = req.body;
            if (!appointmentId) {
                return res.status(400).json({ message: "Missing required parameters" });
            }
            const appointment = await this.paymentService.getAppointmentById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: "Appointment not found" });
            }
            const paymentId = appointment.paymentId;
            if (!paymentId) {
                return res.status(400).json({ message: "No payment ID found for this appointment" });
            }
            const refundDetails = await this.paymentService.processRefund(appointmentId, paymentId);
            if (refundDetails) {
                return res.status(200).json({
                    success: true,
                    message: "Refund processed successfully",
                    refundDetails
                });
            }
            return res.status(400).json({
                success: false,
                message: "Failed to process refund"
            });
        }
        catch (error) {
            console.error("Refund Error:", error);
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Internal Server Error"
            });
        }
    }
}
exports.default = PaymentController;
