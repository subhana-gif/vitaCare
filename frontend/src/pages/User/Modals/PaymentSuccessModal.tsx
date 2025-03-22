import React from "react";
import  Button  from "../../../components/ui/button";
import { formatDate } from "../../../utils/dateUtils";

// Simple SVG icon components defined inline
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="46" height="43" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </svg>
);

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentDetails: {
    doctorName: string;
    speciality: string;
    date: string;
    time: string;
    address: string;
    fee: number;
  } | null;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  appointmentDetails,
}) => {
  if (!isOpen || !appointmentDetails) return null;

  const { doctorName, speciality, date, time, address, fee } = appointmentDetails;

  // Format date for better readability if needed
  const formattedDate = formatDate ? formatDate(date) : date;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? "visible" : "invisible"}`}>
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 z-10 overflow-hidden">
        {/* Success header */}
        <div className="bg-green-500 p-6 text-white text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <span className="h-16 w-16"><CheckCircleIcon /></span>
          </div>
          <h3 className="text-3xl font-bold">Payment Successful!</h3>
          <p className="mt-2 text-lg">Your appointment has been confirmed</p>
        </div>
        
        {/* Appointment details */}
        <div className="p-6">
          <h4 className="text-2xl font-semibold text-center mb-6">
            Welcome to VitaCare
          </h4>
          
          <p className="text-gray-600 mb-6 text-center text-xl">
            We're excited to have you join us for your upcoming consultation. 
            Here are your appointment details:
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-green-500">
                <CalendarIcon />
              </div>
              <div className="ml-3">
                <p className="text-md font-medium text-gray-900">Appointment Date</p>
                <p className="text-md text-gray-500">{formattedDate}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-green-500">
                <ClockIcon />
              </div>
              <div className="ml-3">
                <p className="text-md font-medium text-gray-900">Appointment Time</p>
                <p className="text-md text-gray-500">{time}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-green-500">
                <div className="h-5 w-5 flex items-center justify-center">👨‍⚕️</div>
              </div>
              <div className="ml-3">
                <p className="text-md font-medium text-gray-900">Doctor</p>
                <p className="text-md text-gray-500">Dr. {doctorName} ({speciality})</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-green-500">
                <MapPinIcon />
              </div>
              <div className="ml-3">
                <p className="text-md font-medium text-gray-900">Location</p>
                <p className="text-md text-gray-500">{address}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1 text-green-500">
                <CreditCardIcon />
              </div>
              <div className="ml-3">
                <p className="text-md font-medium text-gray-900">Payment Amount</p>
                <p className="text-md text-gray-500">₹{fee.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800 text-md">
              <strong>Important:</strong> Please arrive 15 minutes before your scheduled appointment. 
              Don't forget to bring any relevant medical records or test results.
            </p>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={onClose}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Got it
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 text-center mt-4">
            We hope your consultation with VitaCare will be beneficial. 
            You can manage this appointment from your "My Appointments" dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};