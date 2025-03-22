import { FaUserMd, FaCalendarCheck, FaUsers } from "react-icons/fa";
import { useState } from "react";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]); // No default appointments

  const updateStatus = (id, newStatus) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status: newStatus } : appointment
      )
    );
  };

  return (
    <div>
      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg flex items-center">
          <FaUserMd className="text-3xl mr-3" />
          <div>
            <h3 className="text-lg font-bold">Earnings</h3>
            <p>0</p>
          </div>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg flex items-center">
          <FaCalendarCheck className="text-3xl mr-3" />
          <div>
            <h3 className="text-lg font-bold">Appointments</h3>
            <p>{appointments.length}</p>
          </div>
        </div>
        <div className="bg-purple-500 text-white p-4 rounded-lg flex items-center">
          <FaUsers className="text-3xl mr-3" />
          <div>
            <h3 className="text-lg font-bold">Patients</h3>
            <p>0</p>
          </div>
        </div>
      </div>

      {/* Latest Appointments Section */}
      <h2 className="text-xl font-bold mb-3">Latest Appointments</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments available.</p>
      ) : (
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-indigo-500 text-white">
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-b">
                <td className="p-3">{appointment.patient}</td>
                <td className="p-3">{appointment.date}</td>
                <td
                  className={`p-3 font-bold ${
                    appointment.status === "Cancelled" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {appointment.status}
                </td>
                <td className="p-3">
                  {appointment.status === "Pending" && (
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

export default DoctorDashboard;
