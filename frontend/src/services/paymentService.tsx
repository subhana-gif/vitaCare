import { Appointment } from "../types/appointment";
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import { RootState } from "../redux/store"; 
import 'react-toastify/dist/ReactToastify.css';

interface PaymentResult {
  success: boolean;
  message?: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export const handlePaymentProcess = async (
  appointment: Appointment, 
  user: any,
  token:string
): Promise<PaymentResult> => {
  try {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.warn("Razorpay SDK failed to load. Are you online?");
      return { success: false, message: "Failed to load payment gateway" };
    }

    const amount = appointment.appointmentFee;
    const response = await fetch("http://localhost:5001/api/payment/payonline", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, currency: "INR" }),
    });
    
    const orderData = await response.json();
    if (!orderData || !orderData.id) 
      throw new Error("Invalid order data received.");

    return new Promise((resolve) => {
      const options = {
        key: "rzp_test_4MBYamMKeUifHI",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Doctor Appointment",
        description: `Consultation with ${appointment.doctorId.name || "Doctor"}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch("http://localhost:5001/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: orderData.id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                appointmentId: appointment._id,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              toast.success("Payment Successful!");
              resolve({ success: true });
            } else {
              toast.error("Payment Verification Failed!");
              resolve({ success: false, message: "Verification failed" });
            }
          } catch (error) {
            console.error("Verification error:", error);
            resolve({ success: false, message: "Error during verification" });
          }
        },
        prefill: { 
          name: user?.name || "Patient",
          email: user?.email || "patient@example.com", 
          contact: user?.phone || "9999999999" 
        },
        theme: { color: "#4f46e5" },
      };

      const razor = new (window as any).Razorpay(options);
      razor.open();
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return { success: false, message: "Payment process failed" };
  }
};