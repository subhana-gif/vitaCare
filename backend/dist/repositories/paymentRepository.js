"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const razorpay_1 = __importDefault(require("../utils/razorpay"));
class PaymentRepository {
    async createOrder(params) {
        return await razorpay_1.default.orders.create(params);
    }
    async verifyPayment({ order_id, payment_id, signature }) {
        const crypto = require("crypto");
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order_id}|${payment_id}`)
            .digest("hex");
        return generatedSignature === signature;
    }
    async createRefund({ paymentId, amount, notes }) {
        return await razorpay_1.default.payments.refund(paymentId, {
            amount,
            notes,
            speed: "optimum"
        });
    }
    async getPaymentDetails(paymentId) {
        return await razorpay_1.default.payments.fetch(paymentId);
    }
}
exports.default = PaymentRepository;
