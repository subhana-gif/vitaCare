import razorpay from "../utils/razorpay";
import { IPaymentRepository, IPaymentOrder, IRefundParams } from "../interfaces/payment/IPayment";

class PaymentRepository implements IPaymentRepository {
  async createOrder(params: IPaymentOrder) {
    return await razorpay.orders.create(params);
  }

  async verifyPayment({ order_id, payment_id, signature }: { order_id: string; payment_id: string; signature: string }) {
    const crypto = require("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    return generatedSignature === signature;
  }

  async createRefund({ paymentId, amount, notes }: IRefundParams) {
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

export default PaymentRepository;