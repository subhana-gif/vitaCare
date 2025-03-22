import React, { useState } from "react";
import { X } from "lucide-react";
import PrescriptionModal from './PrescriptionModal';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

interface Patient {
  name: string;
  email: string;
  phone: string;
  dob: string;
}

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ isOpen, onClose, appointment }) => {
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState<boolean>(false);

  if (!isOpen || !appointment) return null;

  const patient = appointment.patientId as unknown as Patient;

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Appointment Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-blue-600">
                  {patient?.name ? patient.name.charAt(0) : "?"}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{patient?.name || "N/A"}</h3>
                <p className="text-sm text-gray-600">
                  {patient?.dob ? `${calculateAge(patient.dob)} years old` : "Age not available"}
                </p>
              </div>
            </div>
          </div>
          
          <InfoField label="Email" value={patient?.email || "N/A"} />
          <InfoField label="Phone" value={patient?.phone || "N/A"} />
          
          <InfoField 
            label="Date & Time" 
            value={appointment.date ? new Date(appointment.date).toLocaleString('en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : "N/A"}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-600">Status</label>
            <div className="mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600">Payment Status</label>
            <div className="mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadgeClass(appointment.paymentStatus)}`}>
                {appointment.paymentStatus}
              </span>
            </div>
          </div>
          
          <InfoField 
            label="Appointment Fee" 
            value={`₹${appointment.appointmentFee.toLocaleString()}`}
            valueClassName="font-semibold text-gray-900"
          />
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          {appointment.status === 'completed' && (
            <button
              onClick={() => {
                setPrescriptionModalOpen(true);
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              Give Prescription
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
        
        <PrescriptionModal
          isOpen={prescriptionModalOpen}
          onClose={() => setPrescriptionModalOpen(false)}
          appointmentId={appointment._id}
          patientName={patient?.name || ''}
        />
      </div>
    </div>
  );
};

const InfoField: React.FC<{
  label: string;
  value: string;
  valueClassName?: string;
}> = ({ label, value, valueClassName = "" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    <p className={`mt-1 text-lg ${valueClassName}`}>{value}</p>
  </div>
);

export default AppointmentDetailsModal;