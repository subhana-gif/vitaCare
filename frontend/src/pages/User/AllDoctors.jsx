import React, { useState, useEffect } from "react";
import { BsSearch } from "react-icons/bs";

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const doctorsPerPage = 9;

  const specializations = [
    "General",
    "Gynecologist",
    "Dermatologist",
    "Pediatric",
    "Neurologist",
    "Gastroenterologist",
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/doctors");
        const data = await response.json();
        setDoctors(data.doctors); // Ensure correct data structure
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // Filter doctors based on search and specialization
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedSpecialization === "" || doctor.specialization === selectedSpecialization)
  );

  // Pagination Logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  return (
    <div className="flex">
      {/* Sidebar for Specialization */}
      <div className="w-1/4 p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Specializations</h2>
        <ul className="space-y-2">
          {specializations.map((specialization, index) => (
            <li
              key={index}
              className={`cursor-pointer p-2 rounded-lg ${
                selectedSpecialization === specialization ? "bg-blue-500 text-white" : "bg-white text-gray-700"
              } hover:bg-blue-300`}
              onClick={() => setSelectedSpecialization(specialization === selectedSpecialization ? "" : specialization)}
            >
              {specialization}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 bg-white shadow-lg rounded-lg">
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
    <div key={doctor._id} className="w-72 bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Doctor Image */}
      <div className="w-full bg-gray-200">
        <img
          src={doctor.image ? `http://localhost:5000${doctor.image}` : "https://via.placeholder.com/180"}
          alt={doctor.name}
          className="w-full"
        />
      </div>

      {/* Doctor Details */}
      <div className="p-4 text-center">
        <h3 className="text-xl font-semibold">{doctor.name}</h3>
        <p className="text-gray-500 text-sm">{doctor.speciality || "No specialization"}</p>
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
    </div>
  );
};

export default AllDoctors;
