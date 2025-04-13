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
Object.defineProperty(exports, "__esModule", { value: true });
class PaymentService {
    constructor(paymentRepository, appointmentRepository) {
        this.paymentRepository = paymentRepository;
        this.appointmentRepository = appointmentRepository;
    }
    createOrder(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderParams = {
                amount: amount * 100, // Razorpay expects amount in paise
                currency: "INR",
                receipt: `order_rcptid_${Date.now()}`,
            };
            return this.paymentRepository.createOrder(orderParams);
        });
    }
    verifyPayment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { order_id, payment_id, signature, appointmentId } = data;
            const isValid = yield this.paymentRepository.verifyPayment({ order_id, payment_id, signature });
            if (!isValid)
                return false;
            yield this.appointmentRepository.updatePaymentStatus(appointmentId, "paid", payment_id);
            return true;
        });
    }
    processRefund(appointmentId, paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const paymentDetails = yield this.paymentRepository.getPaymentDetails(paymentId);
            if (!paymentDetails)
                return null;
            const refundAmount = (_a = Number(paymentDetails.amount)) !== null && _a !== void 0 ? _a : 0;
            if (refundAmount <= 0)
                return null;
            const refund = yield this.paymentRepository.createRefund({
                paymentId,
                amount: refundAmount,
                notes: { appointmentId, reason: "Appointment Cancellation" }
            });
            if (!refund)
                return null;
            yield this.appointmentRepository.updatePaymentStatus(appointmentId, "refunded");
            return {
                refundId: refund.id,
                amount: (_b = refund.amount) !== null && _b !== void 0 ? _b : 0,
                createdAt: new Date()
            };
        });
    }
    getAppointmentById(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.appointmentRepository.getById(appointmentId);
        });
    }
}
exports.default = PaymentService;
