"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PaymentService {
    constructor(paymentRepository, appointmentRepository) {
        this.paymentRepository = paymentRepository;
        this.appointmentRepository = appointmentRepository;
    }
    async createOrder(amount) {
        const orderParams = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`,
        };
        return this.paymentRepository.createOrder(orderParams);
    }
    async verifyPayment(data) {
        const { order_id, payment_id, signature, appointmentId } = data;
        const isValid = await this.paymentRepository.verifyPayment({ order_id, payment_id, signature });
        if (!isValid)
            return false;
        await this.appointmentRepository.updatePaymentStatus(appointmentId, "paid", payment_id);
        return true;
    }
    async processRefund(appointmentId, paymentId) {
        const paymentDetails = await this.paymentRepository.getPaymentDetails(paymentId);
        if (!paymentDetails)
            return null;
        const refundAmount = Number(paymentDetails.amount) ?? 0;
        if (refundAmount <= 0)
            return null;
        const refund = await this.paymentRepository.createRefund({
            paymentId,
            amount: refundAmount,
            notes: { appointmentId, reason: "Appointment Cancellation" }
        });
        if (!refund)
            return null;
        await this.appointmentRepository.updatePaymentStatus(appointmentId, "refunded");
        return {
            refundId: refund.id,
            amount: refund.amount ?? 0,
            createdAt: new Date()
        };
    }
    async getAppointmentById(appointmentId) {
        return this.appointmentRepository.getById(appointmentId);
    }
}
exports.default = PaymentService;
