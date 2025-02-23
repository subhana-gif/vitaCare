import { useState, useEffect } from "react";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  // Fetch appointments from database (dummy fetch function)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments"); // Replace with your actual API endpoint
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status: newStatus } : appointment
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Appointments</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments available.</p>
      ) : (
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-indigo-500 text-white">
              <th className="p-3 text-left">Sl. No</th>
              <th className="p-3 text-left">Patient Name</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Age</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time Slot</th>
              <th className="p-3 text-left">Fee</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => (
              <tr key={appointment.id} className="border-b">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{appointment.patient}</td>
                <td className="p-3">{appointment.payment}</td>
                <td className="p-3">{appointment.age}</td>
                <td className="p-3">{appointment.date}</td>
                <td className="p-3">{appointment.time}</td>
                <td className="p-3">{appointment.fee}</td>
                <td className="p-3">
                  {appointment.status === "Pending" ? (
                    <>
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                        onClick={() => updateStatus(appointment.id, "Completed")}
                      >
                        Complete
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => updateStatus(appointment.id, "Cancelled")}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <span
                      className={`p-2 rounded text-white ${
                        appointment.status === "Completed" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Appointments;
