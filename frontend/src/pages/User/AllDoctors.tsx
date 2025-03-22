import React, { useState, useEffect } from "react";
import { BsSearch, BsArrowLeft, BsArrowRight, BsFilterCircle } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { doctorService } from "../../services/doctorService";
import { adminService } from "../../services/adminSevice";
import axios from "axios";

interface Doctor {
  _id: string;
  name: string;
  speciality?: string;
  imageUrl?: string;
  available?: boolean;
}

const AllDoctors: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const specialtyParam = queryParams.get("specialty") || "";
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const doctorsPerPage = 9;

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/admin/specialities"); 
        const activeSpecializations = response.data
          .filter((spec: { isActive: boolean }) => spec.isActive) // Filter active ones
          .map((spec: { name: string }) => spec.name); 
        
        setSpecializations(activeSpecializations);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };
  
    fetchSpecializations();
  }, []);
  

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log("Fetching all doctors...");
        const response = await doctorService.fetchAllDoctors();
        const activeDoctors = response.doctors.filter((doctor) => !doctor.isBlocked);

        console.log("Fetched Doctors:", activeDoctors);

        // Extract unique specialities
        const specialities = [...new Set(activeDoctors.map((doctor) => doctor.speciality))];
        console.log("Extracted Specialities:", specialities);

        // Check each speciality status in backend
        const activeSpecialities = new Set();

// Ensure speciality is treated as a string before using toLowerCase()
for (const speciality of specialities) {
  if (!speciality || typeof speciality !== "string") continue; // Skip invalid values
  try {
    const specialityResponse = await adminService.checkSpecialityStatus(speciality);
    if (specialityResponse?.isActive) {
      activeSpecialities.add(speciality.toLowerCase());
    }
  } catch (error) {
    console.error(`Error checking speciality (${speciality}):`, error);
  }
}

        // Filter doctors based on active specialities
        const filteredDoctors = activeDoctors.filter((doctor) =>
          activeSpecialities.has(doctor.speciality.toLowerCase())
        );

        console.log("Filtered Doctors:", filteredDoctors);
        setDoctors(filteredDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, []);              
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedSpecialization === "" || doctor.speciality === selectedSpecialization)
  );



  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handleSpecialtySelection = (specialization: string) => {
    const newSpecialization = specialization === selectedSpecialization ? "" : specialization;
    setSelectedSpecialization(specialtyParam || "");
    setCurrentPage(1);
    navigate(`/doctors?specialty=${newSpecialization}`);
  };

  const handleViewProfile = (doctorId: string) => {
    navigate(`/doctors/${doctorId}`);
};

  return (
    <div className="w-full px-2 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 px-2">Find Your Doctor</h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Mobile filter toggle */}
        <button 
          className="md:hidden flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg mx-2 mb-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <BsFilterCircle /> {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

{/* Sidebar filters */}
<div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-1/5 px-2`}>
  <div className="sticky top-20 bg-white rounded-xl shadow-md p-4 border border-gray-100">
    <h2 className="text-lg font-semibold mb-3 text-gray-800">Specializations</h2>
    <div className="space-y-1">
      <div
        className={`cursor-pointer p-2 rounded-lg transition-all ${
          !specialtyParam ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-700"
        } hover:bg-blue-100 hover:text-blue-700`}
        onClick={() => handleSpecialtySelection("")}
      >
        All Specialties
      </div>
      
      {specializations.map((specialization, index) => (
        <div
          key={index}
          className={`cursor-pointer p-2 rounded-lg transition-all ${
            specialtyParam === specialization ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-700"
          } hover:bg-blue-100 hover:text-blue-700`}
          onClick={() => handleSpecialtySelection(specialization)}
        >
          {specialization}
        </div>
      ))}
    </div>
  </div>
</div>

        {/* Main content */}
        <div className="flex-1 px-2">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search doctors by name..."
              className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          </div>

          {filteredDoctors.length > 0 ? (
            <>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {currentDoctors.map((doctor) => (
                  <div 
                    key={doctor._id} 
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 transition-transform hover:shadow-md hover:-translate-y-1 cursor-pointer"
                    onClick={() => navigate(`/doctors/${doctor._id}`)}
                  >
                    <div className="h-96 overflow-hidden bg-gray-100">
                      <img
                        src={doctor.imageUrl || "https://via.placeholder.com/300x200?text=Doctor"}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-semibold text-gray-800 truncate">{doctor.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          doctor.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {doctor.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{doctor.speciality || "General Medicine"}</p>
                      
                      <button
                      className="w-full py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                      onClick={() => handleViewProfile(doctor._id)}  // Pass doctor ID here
                    >
                      View Profile
                    </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-6">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-white border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <BsArrowLeft /> Prev
                  </button>
                  
                  <div className="mx-2 flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-1 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-md ${
                              currentPage === page 
                                ? "bg-blue-500 text-white" 
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))
                    }
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-white border border-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next <BsArrowRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-1">No doctors found</h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllDoctors;