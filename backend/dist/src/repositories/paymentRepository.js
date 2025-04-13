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
const razorpay_1 = __importDefault(require("../utils/razorpay"));
class PaymentRepository {
    createOrder(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield razorpay_1.default.orders.create(params);
        });
    }
    verifyPayment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ order_id, payment_id, signature }) {
            const crypto = require("crypto");
            const generatedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(`${order_id}|${payment_id}`)
                .digest("hex");
            return generatedSignature === signature;
        });
    }
    createRefund(_a) {
        return __awaiter(this, arguments, void 0, function* ({ paymentId, amount, notes }) {
            return yield razorpay_1.default.payments.refund(paymentId, {
                amount,
                notes,
                speed: "optimum"
            });
        });
    }
    getPaymentDetails(paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield razorpay_1.default.payments.fetch(paymentId);
        });
    }
}
exports.default = PaymentRepository;
