import React, { useEffect, useState } from "react";
import { doctorService } from "../../services/doctorService";

interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  degree: string;
  experience: string;
  address: string;
  appointmentFee: number;
  available: boolean;
  status: string;
  imageUrl?: string;
}

const RejectedDoctors: React.FC = () => {
  const [rejectedDoctors, setRejectedDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchRejectedDoctors = async () => {
      try {
        const doctorsData = await doctorService.fetchAllDoctors();
        const filteredDoctors = doctorsData.doctors.filter(
          (doctor: Doctor) => doctor.status === "rejected"
        );
        setRejectedDoctors(filteredDoctors);
      } catch (error) {
        console.error("Error fetching rejected doctors:", error);
      }
    };

    fetchRejectedDoctors();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4 text-red-600">❌ Rejected Doctors</h1>

      {rejectedDoctors.length === 0 ? (
        <p>No rejected doctors found.</p>
      ) : (
        <ul className="space-y-4">
          {rejectedDoctors.map((doctor) => (
            <li
              key={doctor._id}
              className="p-4 bg-red-100 border border-red-400 rounded-md flex items-center gap-4 shadow-md"
            >
              {/* Doctor Image on Left Side */}
              <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-300">
                <img
                  src={doctor.imageUrl ? doctor.imageUrl : "https://via.placeholder.com/180"}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Doctor Details on Right Side */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-700">{doctor.name}</h3>
                <p className="text-gray-700">Speciality: {doctor.speciality}</p>
                <p className="text-gray-700">Experience: {doctor.experience} years</p>
                <p className="text-gray-700">Address: {doctor.address}</p>
                <p className="text-gray-700">Status: {doctor.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RejectedDoctors;
