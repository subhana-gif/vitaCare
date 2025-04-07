import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import AppointmentFilters from "./AppointmentFilters";
import AppointmentList from "./AppointmentList";
import Pagination from "../Common/Pagination";
import LoadingState from "../Common/LoadingState";
import ErrorState from "../Common/ErrorState";
import EmptyState from "./EmptyState";
import { fetchAppointmentsApi, cancelAppointmentApi } from "../../services/appointmentService";
import { handlePaymentProcess } from "../../services/paymentService";
import { Appointment } from "../../types/appointment";
import { CancellationModal } from "./Modals/CancellationModal";
import { PaymentSuccessModal } from "./Modals/PaymentSuccessModal";
import { ToastProvider, useToast } from "./Toast/ToastContext.tsx";

// Extend Appointment interface to include createdAt (adjust based on your actual data)
interface ExtendedAppointment extends Appointment {
  createdAt?: string; // Assuming this exists in your backend data
}

const AppointmentsWithToast: React.FC = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<ExtendedAppointment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const hasFetched = useRef<boolean>(false);
  
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [cancellationDetails, setCancellationDetails] = useState<{
    paymentStatus: string;
    doctorName: string;
    date: string;
    time: string;
    fee?: number;
  } | null>(null);
  
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState<boolean>(false);
  const [paymentSuccessDetails, setPaymentSuccessDetails] = useState<{
    doctorName: string;
    speciality: string;
    date: string;
    time: string;
    address: string;
    fee: number;
  } | null>(null);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token || hasFetched.current) return;

      try {
        setLoading(true);
        const fetchedAppointments = await fetchAppointmentsApi(token);
        // Sort appointments by createdAt in descending order (latest first)
        const sortedAppointments = fetchedAppointments.sort((a: ExtendedAppointment, b: ExtendedAppointment) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        setAppointments(sortedAppointments);
        setFilteredAppointments(sortedAppointments);
        hasFetched.current = true;
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to load appointments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  useEffect(() => {
    // Apply filters and search
    let results = [...appointments]; // Create a copy to avoid mutating state directly
  
    // Apply payment filter
    if (filter === "paid") {
      results = results.filter(appt => appt.paid || appt.paymentStatus === "paid");
    } else if (filter === "unpaid") {
      results = results.filter(appt => appt.paymentStatus === "pending" && appt.status !== "cancelled");
    } else if (filter === "cancelled") {
      results = results.filter(appt => appt.status === "cancelled");
    }
  
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        appt => 
          appt.doctorId?.name?.toLowerCase().includes(term) ||
          appt.doctorId?.speciality?.toLowerCase().includes(term) ||
          appt.date?.toLowerCase().includes(term)
      );
    }
  
    setFilteredAppointments(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [appointments, searchTerm, filter]);

  const handleCancelClick = (appointmentId: string) => {
    const appointment = appointments.find(app => app._id === appointmentId);
    
    if (appointment) {
      setAppointmentToCancel(appointmentId);
      setCancellationDetails({
        paymentStatus: appointment.paymentStatus || "",
        doctorName: appointment.doctorId?.name || "Unknown Doctor",
        date: appointment.date,
        time: appointment.time,
        fee: appointment.appointmentFee,
      });
      setCancelModalOpen(true);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!appointmentToCancel || !token) {
      setCancelModalOpen(false);
      return;
    }

    try {
      setLoading(true);
      setCancelModalOpen(false);

      const updatedAppointments = appointments.map((appt) => 
        appt._id === appointmentToCancel 
          ? { ...appt, status: "cancelled", cancellationReason: reason } 
          : appt
      );
      
      setAppointments(updatedAppointments);

      await cancelAppointmentApi(appointmentToCancel, token, reason);
      showToast("Appointment cancelled successfully", "success");
      
      const cancelledAppointment = appointments.find(app => app._id === appointmentToCancel);
      if (cancelledAppointment?.paid || cancelledAppointment?.paymentStatus === "paid") {
        showToast("Your refund has been initiated", "info");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      const originalAppointments = [...appointments];
      setAppointments(originalAppointments);
      showToast("Failed to cancel appointment. Please try again.", "error");
    } finally {
      setLoading(false);
      setAppointmentToCancel(null);
      setCancellationDetails(null);
    }
  };

  const handlePayment = async (appointment: ExtendedAppointment) => {
    try {
      const paymentResult = await handlePaymentProcess(appointment, user, token || "");
      
      if (paymentResult.success) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((appt) =>
            appt._id === appointment._id ? { ...appt, paid: true, paymentStatus: "paid" } : appt
          )
        );
        
        setPaymentSuccessDetails({
          doctorName: appointment.doctorId?.name || "Unknown Doctor",
          speciality: appointment.doctorId?.speciality || "Specialty not specified",
          date: appointment.date,
          time: appointment.time,
          address: appointment.doctorId?.address || "Address not available",
          fee: appointment.appointmentFee || 0
        });
        setPaymentSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      showToast("Payment failed. Please try again.", "error");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  if (loading && appointments.length === 0) {
    return <LoadingState message="Loading your appointments..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={() => { hasFetched.current = false; setError(null); }}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">My Appointments</h2>
        
        <AppointmentFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
        />
      </div>

      {filteredAppointments.length > 0 ? (
        <>
          <AppointmentList 
            appointments={currentAppointments} 
            onPayment={handlePayment}
            onCancel={handleCancelClick}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          
          {filteredAppointments.length < appointments.length && (
            <div className="mt-6 text-base text-gray-500 text-center">
              Showing filtered results. Clear filters to see all appointments.
            </div>
          )}
        </>
      ) : (
        <EmptyState hasFilters={searchTerm !== "" || filter !== "all"} />
      )}
      
      <CancellationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        appointmentDetails={cancellationDetails}
      />
      
      <PaymentSuccessModal
        isOpen={paymentSuccessModalOpen}
        onClose={() => setPaymentSuccessModalOpen(false)}
        appointmentDetails={paymentSuccessDetails}
      />
    </div>
  );
};

const MyAppointments: React.FC = () => {
  return (
    <ToastProvider>
      <AppointmentsWithToast />
    </ToastProvider>
  );
};

export default MyAppointments;