import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PrescriptionModal from "./PrescriptionModal";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Appointment {
  _id: string;
  patientId: string;
  date: string;
  time: string;
  status: string;
  paymentStatus: string;
  appointmentFee: number;
  patientName?: string;
  paymentId?: string;
}

const AppointmentPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState<boolean>(false);
  const MySwal = withReactContent(Swal);
  const token = useSelector((state: RootState) => state.doctors.token);
  const doctorId = useSelector((state: RootState) => state.doctors.doctorId);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5001/api/appointments/doctor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAppointments(response.data.appointments);
        setError(null);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to fetch appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) fetchAppointments();
  }, [doctorId, token]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const appointment = appointments.find(appt => appt._id === appointmentId);
      
      if (newStatus === "cancelled" && appointment?.paymentStatus === "paid") {
        // Enhanced confirmation modal
        const result = await MySwal.fire({
          title: '<span class="text-red-600">Confirm Refund</span>',
          html: `
            <div class="text-left p-2">
              <div class="flex items-center mb-4 text-orange-600">
                <i class="fas fa-exclamation-circle text-xl mr-2"></i>
                <span>This appointment has been paid and will be cancelled.</span>
              </div>
              <div class="border-t border-b border-gray-200 py-3 my-3">
                <p className="mb-2"><strong>Patient:</strong> ${(appointment.patientId as unknown as Patient)?.name || "N/A"}</p>
                <p class="mb-2"><strong>Appointment Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                <p class="mb-2"><strong>Amount Paid:</strong> ₹${(appointment.appointmentFee / 100).toFixed(2)}</p>
                <p class="mb-2"><strong>Payment ID:</strong> ${appointment.paymentId}</p>
              </div>
              <p class="mt-4 text-sm text-gray-600">A refund will be initiated to the original payment method.</p>
            </div>
          `,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: '<i class="fas fa-undo mr-1"></i> Process Refund',
          cancelButtonText: '<i class="fas fa-times mr-1"></i> Cancel',
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          reverseButtons: true,
          focusCancel: true,
          customClass: {
            container: 'refund-swal-container',
            popup: 'refund-swal-popup rounded-lg',
            title: 'text-xl',
          }
        });
  
        if (!result.isConfirmed) return;
  
        try {
          // Show processing state
          MySwal.fire({
            title: 'Processing Refund',
            html: '<div class="flex justify-center"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div><p class="mt-4">Please wait while we process your refund...</p>',
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
              MySwal.showLoading();
            }
          });
          
          const refundResponse = await axios.post(
            "http://localhost:5001/api/payment/refund",
            {
              appointmentId,
              paymentId: appointment.paymentId,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
  
          if (!refundResponse.data.success) {
            throw new Error(refundResponse.data.message || "Refund failed");
          }
  
          const refundDetails = refundResponse.data.refundDetails;
          
          // Enhanced success modal
          await MySwal.fire({
            title: '<span class="text-green-600">Refund Successful</span>',
            html: `
              <div class="text-left p-2">
                <div class="flex justify-center mb-5">
                  <div class="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                    <i class="fas fa-check-circle text-green-500 text-3xl"></i>
                  </div>
                </div>
                <div class="border rounded-lg p-4 bg-gray-50">
                  <div class="grid grid-cols-2 gap-2">
                    <p class="text-gray-600">Refund ID:</p>
                    <p class="font-semibold">${refundDetails.refundId}</p>
                    
                    <p class="text-gray-600">Amount Refunded:</p>
                    <p class="font-semibold text-green-600">₹${(refundDetails.amount / 100).toFixed(2)}</p>
                    
                    <p class="text-gray-600">Status:</p>
                    <p class="font-semibold">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Processed
                      </span>
                    </p>
                    
                    <p class="text-gray-600">Date:</p>
                    <p class="font-semibold">${new Date(refundDetails.createdAt).toLocaleString()}</p>
                    
                    <p class="text-gray-600">Payment Method:</p>
                    <p class="font-semibold">${refundDetails.paymentMethod || "Original Payment Method"}</p>
                  </div>
                </div>
                <p class="mt-4 text-sm text-gray-600">The refund has been successfully processed.</p>
              </div>
            `,
            icon: "success",
            confirmButtonText: '<i class="fas fa-check mr-1"></i> Done',
            confirmButtonColor: "#10B981",
            customClass: {
              popup: 'rounded-lg',
              title: 'text-xl',
              confirmButton: 'px-6'
            }
          });
          
        } catch (error) {
          console.error("Refund processing error:", error);
          // Enhanced error modal
          await MySwal.fire({
            title: '<span class="text-red-600">Refund Failed</span>',
            html: `
              <div class="text-left p-2">
                <div class="flex justify-center mb-5">
                  <div class="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                    <i class="fas fa-times-circle text-red-500 text-3xl"></i>
                  </div>
                </div>
                <p class="mb-4">We couldn't process the refund for this appointment.</p>
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p class="font-medium">Error details:</p>
                  <p class="text-sm text-gray-700">${error.message || "Unknown error occurred"}</p>
                </div>
                <p class="mt-4 text-sm text-gray-600">Please try again or contact support if the issue persists.</p>
              </div>
            `,
            icon: "error",
            confirmButtonText: 'Try Again',
            confirmButtonColor: "#d33",
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            customClass: {
              popup: 'rounded-lg',
              title: 'text-xl',
            }
          });
          return;
        }
      }
  
      // Update appointment status
      const response = await axios.put(
        `http://localhost:5001/api/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt._id === appointmentId
            ? { ...appt, status: newStatus, ...(newStatus === "completed" && { paymentStatus: "paid" }) }
            : appt
        )
      );
  
      toast.success("Status updated successfully.");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };  
  
  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full px-1">
      <h1 className="text-2xl font-semibold mb-6">Appointments</h1>
      
      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-pulse text-gray-400 text-lg">Loading appointments...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4 text-lg">
          {error}
        </div>
      )}
      
      {!loading && !error && appointments.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-8 text-center">
          <p className="text-gray-500 text-lg">No appointments found</p>
          <p className="text-gray-400 mt-1">New appointments will appear here</p>
        </div>
      )}
      
      {!loading && appointments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th scope="col" className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-lg font-medium text-gray-900">
                      {(appointment.patientId as unknown as Patient)?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-lg font-medium text-gray-900">{formatDate(appointment.date)}</div>
                    <div className="text-base text-gray-500">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
  <select
    value={appointment.status}
    onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
    className="border border-gray-300 rounded px-2 py-1 text-gray-700"
    disabled={appointment.status === 'cancelled' || appointment.status === 'completed'} // ✅ Disable for 'cancelled' or 'completed'
  >
    <option value="pending" disabled={appointment.status === "confirmed"}>
      Pending
    </option>
    <option value="confirmed">Confirmed</option>
    <option value="cancelled">Cancelled</option>
    <option value="completed">Completed</option>
  </select>
</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getPaymentBadgeClass(appointment.paymentStatus)}`}>
                      {appointment.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-lg text-gray-700 font-medium">
                    ₹{appointment.appointmentFee.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(appointment)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View Details
                    </button>
                    {appointment.status === 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setPrescriptionModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Give Prescription
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AppointmentDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
      />
      <PrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        appointmentId={selectedAppointment?._id || ''}
        patientName={selectedAppointment ? ((selectedAppointment.patientId as unknown as Patient)?.name || '') : ''}
      />
    </div>
  );
};

export default AppointmentPage;