import React, { useEffect, useState } from "react";
import axios from "axios";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  email: string;
}

interface Appointment {
  _id: string;
  patientId: Patient;
  doctorId: Doctor;
  date: string;
  time: string;
  status: string;
  paymentStatus: string;
  appointmentFee: number;
}

const AdminAppointmentPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Single search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const appointmentsPerPage = 5;

  const token = localStorage.getItem("adminToken");
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5001/api/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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

    fetchAppointments();
  }, [token]);

  // Filter appointments based on search input
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAppointments(appointments);
    } else {
      const query = searchTerm.toLowerCase().trim();
      const filtered = appointments.filter((appointment) => {
        const patientName = appointment.patientId?.name?.toLowerCase() || "";
        const doctorName = appointment.doctorId?.name?.toLowerCase() || "";
        const doctorSpeciality = appointment.doctorId?.speciality?.toLowerCase() || "";
        
        return patientName.includes(query) || 
               doctorName.includes(query) || 
               doctorSpeciality.includes(query);
      });
      
      setFilteredAppointments(filtered);
    }
    
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, appointments]);

  // Set total pages whenever filtered appointments change
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

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Pagination handlers
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    const maxDisplayedPages = 5;
    
    if (totalPages <= maxDisplayedPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of displayed pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning or end
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always include last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="w-full px-1">
      <h1 className="text-2xl font-semibold mb-6">Admin Appointments</h1>

      {/* Single search bar */}
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
            placeholder="Search by patient name, doctor name or speciality..."
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
          Search filters appointments by patient name, doctor name, and speciality
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
          <p className="text-gray-400 mt-1">Try adjusting your search criteria</p>
        </div>
      )}

      {!loading && filteredAppointments.length > 0 && (
        <>
          <div className="bg-white border border-gray-200 rounded overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                  <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-base font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentAppointments().map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-5 whitespace-nowrap text-lg text-gray-900">
                      {appointment.patientId?.name || "N/A"}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-lg text-gray-900">
                      {appointment.doctorId?.name || "N/A"} <span className="text-gray-500">({appointment.doctorId?.speciality || "Unknown"})</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-lg text-gray-900">{formatDate(appointment.date)}</div>
                      <div className="text-base text-gray-500">{appointment.time}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getPaymentBadgeClass(appointment.paymentStatus)}`}>
                        {appointment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-lg text-gray-700 font-medium">
                      ₹{appointment.appointmentFee.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
    </div>
  );
};

export default AdminAppointmentPage;