import axios from "axios";
import { Appointment } from "../types/appointment";

export const fetchAppointmentsApi = async (token: string): Promise<Appointment[]> => {
  const res = await fetch(import.meta.env.VITE_API_BASE_URL +"/appointments/patient", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
});

  if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);

  const response = await res.json();
  const data: Appointment[] = response.appointments;
    return data.filter((appt) => appt.doctorId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const cancelAppointmentApi = async (appointmentId: string, token: string, reason: string): Promise<void> => {
  const response = await fetch(import.meta.env.VITE_API_BASE_URL +`/appointments/${appointmentId}`, { 
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  
  if (!response.ok) throw new Error("Failed to cancel appointment");
};

export const fetchAppointments =  async (token: string) => {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL +"/appointments", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.appointments;
}

export const fetchAppointmentsDoctor =  async (token: string) => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_BASE_URL +"/appointments/doctor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to fetch appointments.";
      throw new Error(errorMsg);
    }
};


export const checkPrescriptionExists = async (appointmentId: string, token: string) => {
  try {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL +`/prescriptions/${appointmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const prescription = response.data;

    // Normalize the ID to _id if needed
    if (prescription && prescription.id && !prescription._id) {
      prescription._id = prescription.id;
    }

    return prescription;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      } else {
        throw new Error(`Failed to fetch prescription: ${error.message}`);
      }
    } else {
      throw new Error("An unexpected error occurred while fetching prescription.");
    }
  }
};

export const updateAppointmentStatus = async (appointmentId: string, newStatus: string, token: string) => {
    try {
      const response = await axios.put(
        import.meta.env.VITE_API_BASE_URL +`/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error updating appointment status:", error.message);
      throw new Error("Failed to update appointment status.");
    }
};



export const refundPayment = async (appointmentId: string, paymentId: string, token: string) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_BASE_URL +"/payment/refund",
        {
          appointmentId,
          paymentId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error processing refund:", error.message);
      throw new Error("Failed to process refund.");
    }
};

export const savePrescription = async (
  data: {
    appointmentId: string;
    medicines: any[];
    diagnosis: string;
    notes: string;
  },
  token: string,
  existingPrescriptionId?: string
) => {
  const method = existingPrescriptionId ? "put" : "post";
  const url = existingPrescriptionId
    ? import.meta.env.VITE_API_BASE_URL +`/prescriptions/${existingPrescriptionId}`
    : import.meta.env.VITE_API_BASE_URL +"/prescriptions";

  const response = await axios[method](url, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};


export const bookAppointment = async (
  patientId: string,
  doctorId: string,
  slotId: string,
  date: string,
  time: string,
  token: string
) => {
  try {
    const response = await axios.post(
      import.meta.env.VITE_API_BASE_URL +`/appointments/book`,
      { patientId, doctorId, slotId, date, time },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    let msg = "Booking failed.";
    if (status === 400) msg = error?.response?.data?.message || "Invalid booking request.";
    else if (status === 404) msg = "Slot or doctor not found.";
    else if (status === 401) msg = "Unauthorized. Please log in again.";
    else msg = error?.response?.data?.message || "An unexpected error occurred.";
    throw new Error(msg);
  }
};

export const appointmentService = {
  fetchAppointmentsApi,
  cancelAppointmentApi,
  fetchAppointments,
  fetchAppointmentsDoctor,
  checkPrescriptionExists,
  updateAppointmentStatus,
  refundPayment,
  savePrescription,
  bookAppointment,
};