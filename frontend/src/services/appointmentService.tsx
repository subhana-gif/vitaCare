import { Appointment } from "../types/appointment";

export const fetchAppointmentsApi = async (token: string): Promise<Appointment[]> => {
  const res = await fetch("http://localhost:5001/api/appointments/patient", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`);

  const data: Appointment[] = await res.json();
  
  return data.filter((appt) => appt.doctorId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const cancelAppointmentApi = async (appointmentId: string, token: string, reason: string): Promise<void> => {
  const response = await fetch(`http://localhost:5001/api/appointments/${appointmentId}`, { 
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  
  if (!response.ok) throw new Error("Failed to cancel appointment");
};