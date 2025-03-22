import React, { useState } from "react";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  appointmentDetails: {
    doctorName: string;
    date: string;
    time: string;
    fee?: number;
  } | null;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointmentDetails
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason.trim().length < 3) {
      setError("Please provide a valid reason for cancellation");
      return;
    }
    onConfirm(reason);
    setReason("");
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold text-gray-900">Cancel Appointment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-8">
          {appointmentDetails && (
            <div className="mb-6 bg-gray-50 p-6 rounded-md">
              <p className="font-bold text-2xl text-gray-900 mb-3">Appointment Details:</p>
              <p className="text-xl text-gray-700 mb-1">Doctor: {appointmentDetails.doctorName}</p>
              <p className="text-xl text-gray-700 mb-1">Date: {appointmentDetails.date}</p>
              <p className="text-xl text-gray-700">Time: {appointmentDetails.time}</p>
              
              {appointmentDetails.fee && (
                <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                  <p className="text-blue-800 font-bold text-lg">
                    If you paid, You will receive a refund of ₹{appointmentDetails.fee.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-medium mb-3">
              Please provide a reason for cancellation:
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter cancellation reason..."
            />
            {error && <p className="mt-2 text-base text-red-600 font-medium">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 text-lg font-medium"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};