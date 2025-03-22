import { AppointmentRepository } from "../repositories/appointmentRepository";
import PaymentRepository from "../repositories/paymentRepository";
import crypto from "crypto";

class PaymentService {
  private appointmentRepository = new AppointmentRepository();

  async createOrder(amount: number) {
    const order = await PaymentRepository.createOrder({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    });
    return order;
  }

  async verifyPayment(data: {
    order_id: string;
    payment_id: string;
    signature: string;
    appointmentId: string;
  }): Promise<boolean> {
    const { order_id, payment_id, signature } = data;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");

    if (generatedSignature !== signature) return false;

    // ✅ Update appointment status and payment ID in the database
    await this.appointmentRepository.updatePaymentStatus(data.appointmentId, "paid", payment_id);

    return true;
  }


  async processRefund(
    appointmentId: string,
    paymentId: string
  ): Promise<{
    refundId: string;
    amount: number;
    createdAt: Date;   // ✅ Corrected to reflect current date/time
  } | null> {
    try {
      const paymentDetails = await PaymentRepository.getPaymentDetails(paymentId);
      if (!paymentDetails) return null;
  
      const refundAmount = Number(paymentDetails.amount) ?? 0;
      if (!refundAmount || refundAmount <= 0) return null;
  
      const refund = await PaymentRepository.createRefund({
        paymentId,
        amount: refundAmount,
        notes: {
          appointmentId,
          reason: "Appointment Cancellation"
        }
      });
  
      if (!refund) return null;
  
      await this.appointmentRepository.updatePaymentStatus(appointmentId, "refunded");
  
      return {
        refundId: refund.id,
        amount: refund.amount ?? 0,
        createdAt: new Date()  // ✅ Sets current date for accurate timestamp
      };
    } catch (error) {
      console.error("Refund processing error:", error);
      throw new Error("Failed to process refund");
    }
  }
      


  }

export default new PaymentService();
