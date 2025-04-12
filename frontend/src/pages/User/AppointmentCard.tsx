import React from "react";
import { Appointment } from "../../types/appointment";
import { formatDate, isUpcoming } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";

interface AppointmentCardProps {
  appointment: Appointment & {
    cancellationReason?: string;
    appointmentFee: string;
    doctorApproval?: {
      status: 'approved' | 'rejected' | 'pending';
      reason?: string;
    };
  };
  onPayment: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPayment,
  onCancel,
}) => {
  // Helper function to get the status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const navigate = useNavigate();

  const handleViewPrescription = () => {
    navigate(`/prescription/${appointment._id}`);
  };

  const handleChatWithDoctor = () => {
    if (appointment.doctorId?._id) {
      navigate(`/chats/${appointment.patientId}/${appointment.doctorId._id}`);
    } else {
      navigate(`/chats`);
    }
  };

  // Function to check if chat button should be shown - only for confirmed/completed appointments
  const shouldShowChatButton = () => {
    return appointment.status === "confirmed" || appointment.status === "completed";
  };

  // Function to render the appropriate action content based on appointment status
  const renderActionContent = () => {
    // Handle cancelled appointments
    if (appointment.status === "cancelled") {
      return (
        <div className="min-h-[80px] flex items-center justify-center">
          <span className="text-center text-gray-500 italic">Appointment cancelled</span>
        </div>
      );
    }
  
    // Handle completed appointments
    if (appointment.status === "completed") {
      return (
        <div className="min-h-[80px] flex flex-col items-center justify-center space-y-3">
          <span className="text-center text-gray-500 italic">Appointment completed</span>
          <button
            onClick={handleViewPrescription}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
          >
            View Prescription
          </button>
          {shouldShowChatButton() && (
            <button
              onClick={handleChatWithDoctor}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Chat with Doctor
            </button>
          )}
        </div>
      );
    }
  
    // Handle past appointments (excluding completed ones)
    if (!isUpcoming(appointment.date)) {
      return (
        <div className="min-h-[80px] flex items-center justify-center">
          <span className="text-center text-gray-500 italic">Past appointment</span>
        </div>
      );
    }
  
    // Handle pending appointments
    if (appointment.status === "pending") {
      return (
        <div className="min-h-[80px] flex items-center justify-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center w-full">
            <div className="flex items-center justify-center mb-2">
              <svg className="animate-spin h-5 w-5 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium text-yellow-700">Awaiting Doctor Approval</span>
            </div>
          </div>
        </div>
      );
    }
  
    // Handle confirmed appointments with payment due
    return (
      <div className="min-h-[80px] flex flex-col justify-center space-y-3">
        {appointment.status === "confirmed" && 
         appointment.paymentStatus === "pending" && 
         !appointment.paid && (
          <button
            onClick={() => onPayment(appointment)}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            Pay Now
          </button>
        )}
        {shouldShowChatButton() && (
          <button
            onClick={handleChatWithDoctor}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
          >
            Chat with Doctor
          </button>
        )}
        {appointment.status !== "pending" && (
          <button
            onClick={() => onCancel(appointment._id)}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
          >
            Cancel Appointment
          </button>
        )}
      </div>
    );
  };

  // Helper function to determine if appointment is active
  const isActive = isUpcoming(appointment.date) && appointment.status !== "cancelled" && appointment.status !== "completed";

  return (
    <tr className={`border-b border-gray-200 ${!isActive ? 'bg-gray-50' : ''} hover:bg-gray-50 transition`}>
      <td className="px-6 py-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-32 w-32 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={appointment?.doctorId?.imageUrl || "/default-doctor.jpg"}
              alt={appointment.doctorId?.name || "Doctor"}
              onError={(e) => { e.currentTarget.src = "/default-doctor.jpg"; }}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-4">
            <p className="font-medium text-xl text-gray-900">{appointment.doctorId?.name || "Unknown Doctor"}</p>
            <p className="text-lg text-gray-500">{appointment.doctorId?.speciality || "Specialty not specified"}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-6">
        {/* Appointment details with icons */}
        <div className="space-y-2">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700 text-lg">{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700 text-lg">{appointment.time}</span>
          </div>
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-700 text-lg">{appointment.doctorId?.address || "Address not available"}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-6">
        {/* Status information with contextual styling */}
        <div className="flex flex-col h-full">
          <div className="mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-medium ${getStatusBadgeStyle(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
          
          {appointment.doctorApproval && (
            <div className="mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                appointment.doctorApproval.status === 'approved' ? 'bg-green-100 text-green-800' :
                appointment.doctorApproval.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                Doctor {appointment.doctorApproval.status}
              </span>
              {appointment.doctorApproval.reason && (
                <p className="text-sm text-gray-600 mt-1 italic">
                  {appointment.doctorApproval.reason}
                </p>
              )}
            </div>
          )}
          
          {/* Payment status */}
          {!appointment.status.match(/^(cancelled|completed)$/) && (
            <div>
              {appointment.paymentStatus === "paid" || appointment.paid ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-lg font-medium bg-green-100 text-green-800">
                  paid
                </span>
              ) : (
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-lg font-medium bg-yellow-100 text-yellow-800">
                    Payment Due
                  </span>
                  <p className="text-gray-500 mt-1 text-xl font-medium">₹{typeof appointment.appointmentFee === 'number' ? appointment.appointmentFee.toLocaleString() : appointment.appointmentFee || 0}</p>
                </div>
              )}
            </div>
          )}
          
          {appointment.cancellationReason && (
            <p className="text-sm text-red-600 italic mt-2">
              Reason: {appointment.cancellationReason}
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-6 min-w-[180px] align-middle">
        {/* Actions with improved styling */}
        {renderActionContent()}
      </td>
    </tr>
  );
};

export default AppointmentCard;