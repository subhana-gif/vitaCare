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

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  timing: string;
}

const AppointmentPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState<boolean>(false);
  const [existingPrescription, setExistingPrescription] = useState<any>(null); // Track existing prescription
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', duration: '', timing: '' },
  ]);

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const appointmentsPerPage = 5;
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
        setFilteredAppointments(response.data.appointments);
        setTotalPages(Math.ceil(response.data.appointments.length / appointmentsPerPage));
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

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAppointments(appointments);
    } else {
      const query = searchTerm.toLowerCase().trim();
      const filtered = appointments.filter((appointment) => {
        const patientName = ((appointment.patientId as unknown as Patient)?.name || "").toLowerCase();
        return patientName.includes(query);
      });
      setFilteredAppointments(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, appointments]);

  // Update total pages when filtered appointments change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredAppointments.length / appointmentsPerPage));
  }, [filteredAppointments]);

  // Get current page appointments
  const getCurrentAppointments = () => {
    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    return filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const checkPrescriptionExists = async (appointmentId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/prescriptions/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Log the prescription data for debugging
      console.log("Existing prescription data:", response.data);
  
      // Return the prescription data
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          // No prescription exists for this appointment
          console.log("No prescription found for appointment ID:", appointmentId);
          return null;
        } else {
          // Handle other Axios errors
          console.error("Error fetching prescription:", error.message);
          throw new Error(`Failed to fetch prescription: ${error.message}`);
        }
      } else {
        // Handle non-Axios errors
        console.error("Unexpected error:", error);
        throw new Error("An unexpected error occurred while fetching prescription.");
      }
    }
  };

const handleGivePrescription = async (appointment: Appointment) => {
  try {
    const existingPrescription = await checkPrescriptionExists(appointment._id);
    setSelectedAppointment(appointment);
    setPrescriptionModalOpen(true);

    if (existingPrescription) {
      // Populate the modal with existing prescription data
      setMedicines(existingPrescription.medicines);
      setDiagnosis(existingPrescription.diagnosis);
      setNotes(existingPrescription.notes);
    } else {
      // Reset the form for a new prescription
      setMedicines([{ name: '', dosage: '', duration: '', timing: '' }]);
      setDiagnosis('');
      setNotes('');
    }
  } catch (error) {
    console.error("Error handling prescription:", error);
    toast.error("Failed to fetch prescription details.");
  }
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
<p className="mb-2"><strong>Amount Paid:</strong> ₹${appointment.appointmentFee.toLocaleString('en-IN')}</p>
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

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxDisplayedPages = 5;
    
    if (totalPages <= maxDisplayedPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i as never);
      }
    } else {
      pages.push(1 as never);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }
      
      if (start > 2) {
        pages.push('...' as never);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i as never);
      }
      
      if (end < totalPages - 1) {
        pages.push('...' as never);
      }
      
      pages.push(totalPages as never);
    }
    
    return pages;
  };

  return (
    <div className="w-full px-1">
      <h1 className="text-2xl font-semibold mb-6">Appointments</h1>

      <div className="mb-6 relative">
        <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-indigo-500 focus-within:border-indigo-500 overflow-hidden">
          <div className="pl-4 pr-2 py-2">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="flex-1 py-2.5 border-0 focus:ring-0 focus:outline-none"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={handleClearSearch} 
              className="px-4 py-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Search appointments by patient name
        </p>
      </div>
      
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
      
      {!loading && !error && filteredAppointments.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded p-8 text-center">
          <p className="text-gray-500 text-lg">No appointments found</p>
          <p className="text-gray-400 mt-1">New appointments will appear here</p>
        </div>
      )}
      
      {!loading && filteredAppointments.length > 0 && (
       <>
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
            {getCurrentAppointments().map((appointment) => (
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
                      disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
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
                        onClick={() => handleGivePrescription(appointment)}
                        className="text-green-600 hover:text-green-900"
                      >
                        {existingPrescription ? 'Edit Prescription' : 'Give Prescription'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
           <div className="flex flex-col sm:flex-row items-center justify-center mt-6 gap-4">
           <div className="flex items-center space-x-1">
             <button
               onClick={handlePrevPage}
               disabled={currentPage === 1}
               className={`px-3 py-1.5 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
             >
               Previous
             </button>
             
             {getPaginationNumbers().map((page, index) => (
               <React.Fragment key={index}>
                 {page === '...' ? (
                   <span className="px-3 py-1.5">...</span>
                 ) : (
                   <button
                     onClick={() => handlePageChange(page as number)}
                     className={`px-3 py-1.5 rounded-md ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                   >
                     {page}
                   </button>
                 )}
               </React.Fragment>
             ))}
             
             <button
               onClick={handleNextPage}
               disabled={currentPage === totalPages || totalPages === 0}
               className={`px-3 py-1.5 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
             >
               Next
             </button>
           </div>
         </div>
           </>
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
        existingPrescription={existingPrescription} // Pass existing prescription
        setMedicines={setMedicines}
        setDiagnosis={setDiagnosis}
        setNotes={setNotes}
      />
    </div>
  );
};

export default AppointmentPage;