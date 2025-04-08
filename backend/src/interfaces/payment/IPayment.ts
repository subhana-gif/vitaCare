

export interface IPaymentOrder {
    amount: number;
    currency: string;
    receipt: string;
  }

  export interface IPaymentOrderResult {
    id: string; // Razorpay order ID
    amount: number;
    currency: string;
    receipt: string;
    status: 'created'; // usually this status after creation
    created_at: number; // Unix timestamp
  }

  export interface IRefundResponse {
    id: string; // Refund ID
    amount: number;
    currency: string;
    created_at: number;
    status: string; // Example: 'processed'
  }

  export interface IPaymentDetails {
    id: string; // Payment ID
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    invoice_id: string | null;
    international: boolean;
    method: string;
    captured: boolean;
    description: string;
    created_at: number;
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