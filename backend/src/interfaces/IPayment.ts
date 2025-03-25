export interface IPaymentOrder {
    amount: number;
    currency: string;
    receipt: string;
  }
  
  export interface IPaymentVerification {
    order_id: string;
    payment_id: string;
    signature: string;
    appointmentId: string;
  }
  
  export interface IRefundParams {
    paymentId: string;
    amount?: number;
    notes?: Record<string, string>;
  }
  
  export interface IRefundResult {
    refundId: string;
    amount: number;
    createdAt: Date;
  }
  
  export interface IPaymentRepository {
    createOrder(params: IPaymentOrder): Promise<any>;
    verifyPayment(data: { order_id: string; payment_id: string; signature: string }): Promise<boolean>;
    createRefund(params: IRefundParams): Promise<any>;
    getPaymentDetails(paymentId: string): Promise<any>;
  }