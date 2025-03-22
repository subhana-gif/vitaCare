import razorpay from "../utils/razorpay";

interface OrderParams {
  amount: number;
  currency: string;
  receipt: string;
}

interface RefundParams {
  paymentId: string;
  amount?: number;
  notes?: Record<string, string>;
}

class PaymentRepository {
  async createOrder(params: OrderParams) {
    return await razorpay.orders.create(params);
  }

  async verifyPayment({ order_id, payment_id, signature }: any) {
    const crypto = require("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    return generatedSignature === signature;
  }

  async createRefund({ paymentId, amount, notes }: RefundParams) {
    return await razorpay.payments.refund(paymentId, {
      amount,
      notes,
      speed: "optimum"
    });
  }

  async getPaymentDetails(paymentId: string) {
    return await razorpay.payments.fetch(paymentId);
  }
}

export default new PaymentRepository();
