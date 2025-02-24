import React, { useState, useEffect } from "react";
import { BsSearch } from "react-icons/bs";

const DoctorListSidebar = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 9; // ✅ Show only 9 doctors per page

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/doctors");
        const data = await response.json();
        setDoctors(data.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // ✅ Filter doctors based on search
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Pagination Logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search doctor..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <BsSearch className="absolute right-4 top-4 text-gray-500" />
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {currentDoctors.length > 0 ? (
    currentDoctors.map((doctor) => (
      <div key={doctor._id} className="w-72 h-96 bg-white shadow-lg rounded-lg overflow-hidden">
        
        {/* Doctor Image in Rectangle */}
        <div className="w-full h-2/3 bg-gray-200">
          <img
            src={doctor.image ? `http://localhost:5000${doctor.image}` : "https://via.placeholder.com/180"}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Doctor Details Below */}
        <div className="h-1/3 p-4 bg-gray-100 flex flex-col items-center">
          <h3 className="text-xl font-semibold">{doctor.name}</h3>
          <p className="text-gray-500 text-sm">{doctor.speciality || "No specialization"}</p>
          <p className={`text-sm font-bold mt-1 ${doctor.available ? "text-green-600" : "text-red-500"}`}>
            {doctor.available ? "✅ Available" : "❌ Not Available"}
          </p>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500 text-center col-span-3">No doctors found</p>
  )}
</div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">{currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastDoctor >= filteredDoctors.length}
          className="px-4 py-2 mx-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DoctorListSidebar;
