import React, { useState, useEffect } from "react";
import { BsSearch } from "react-icons/bs";
import { MdOutlineEventNote } from "react-icons/md";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  useEffect(() => {
    // Fetch appointments from API (replace with actual API call)
    setAppointments([]); // Initially empty, waiting for data
  }, []);

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search appointments..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
        />
        <button className="ml-2 bg-blue-600 text-white p-3 rounded-lg">
          <BsSearch />
        </button>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold flex items-center">
          <MdOutlineEventNote className="text-blue-500 text-2xl mr-2" />
          Appointments
        </h2>

        {appointments.length === 0 ? (
          <p className="text-gray-500 mt-4">No appointments available</p>
        ) : (
          <>
            <ul className="mt-4 space-y-4">
              {currentAppointments.map((appointment, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center">
                    <img
                      src={appointment.image} // Replace with real image
                      alt="Doctor"
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-semibold">{appointment.doctor}</h3>
                      <p className="text-gray-500">{appointment.date}</p>
                    </div>
                  </div>
                  <button className="bg-red-200 text-red-600 p-2 rounded-full">✕</button>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-l-lg bg-gray-200"
              >
                &lt;
              </button>
              {[...Array(Math.ceil(appointments.length / appointmentsPerPage)).keys()].map((num) => (
                <button
                  key={num}
                  onClick={() => paginate(num + 1)}
                  className={`px-4 py-2 border ${
                    currentPage === num + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {num + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(appointments.length / appointmentsPerPage)}
                className="px-4 py-2 border rounded-r-lg bg-gray-200"
              >
                &gt;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Appointments;
