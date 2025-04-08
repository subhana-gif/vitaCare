import { Request, Response } from "express";
import PaymentService from "../services/paymentService";
import { IPaymentVerification } from "../interfaces/payment/IPayment";
import { HttpMessage, HttpStatus } from "../enums/HttpStatus";


class PaymentController {
  private paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  async createOrder(req: Request, res: Response) {
    try {
      const { amount } = req.body;
      const order = await this.paymentService.createOrder(amount);
      res.status(HttpStatus.OK).json(order);
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message:HttpMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async verifyPayment(req: Request, res: Response) {
    try {
      const { order_id, payment_id, signature, appointmentId } = req.body;

      if (!order_id || !payment_id || !signature || !appointmentId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }

      const verificationData: IPaymentVerification = { order_id, payment_id, signature, appointmentId };
      const isValid = await this.paymentService.verifyPayment(verificationData);

      if (!isValid) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }

      return res.status(HttpStatus.OK).json({ success: true, message: HttpMessage.OK });
    } catch (error) {
      console.error("Payment Verification Error:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async processRefund(req: Request, res: Response) {
    try {
      const { appointmentId } = req.body;
  
      if (!appointmentId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
  
      const appointment = await this.paymentService.getAppointmentById(appointmentId);
    
      if (!appointment) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: HttpMessage.NOT_FOUND });
      }
  
      const paymentId = appointment.paymentId;
  
      if (!paymentId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
      }
  
      const refundDetails = await this.paymentService.processRefund(appointmentId, paymentId);
  
      if (refundDetails) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: HttpMessage.OK,
          refundDetails
        });
      }
  
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: HttpMessage.BAD_REQUEST
      });
    } catch (error) {
      console.error("Refund Error:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: HttpMessage.INTERNAL_SERVER_ERROR
      });
    }
  }
}

export default PaymentController;