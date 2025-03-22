import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { doctorService } from "../../services/doctorService";
import dayjs from "dayjs"; // Add this import at the top
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMapMarkerAlt } from "react-icons/fa";
import TimeSlotSelector from './TimeSlotSelector'; // Path to the new component
import DoctorReviews from '../../components/Reviews/DoctorReviews';


interface Doctor {
  available: React.JSX.Element;
  _id: string;
  name: string;
  speciality: string;
  degree: string;
  experience: number;
  address: string;
  appointmentFee: number;
  about: string;
  imageUrl?: string;
}

interface Appointment {
  date: string;
  time: string;
  doctorName: string;
}

interface RootState {
  auth: {
    accessToken: string;
    user: { _id: string } | null;
  };
}

const DoctorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [relatedDoctors, setRelatedDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>("");
  const [selectedSlotPrice, setSelectedSlotPrice] = useState<number>(0);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
  }, [token, user, navigate]);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!id) {
        console.error("Doctor ID is undefined.");
        toast.error("Invalid doctor ID. Please try again.");
        return;
      }
  
      try {
        setIsLoading(true);
        const doctorData = await doctorService.getDoctorById(id);
        setDoctor(doctorData);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        toast.error("Failed to load doctor details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchDoctorDetails();
  }, [id]);
  
  useEffect(() => {
    if (doctor) {
      const fetchBookedSlots = async () => {
        try {
          const res = await fetch(`http://localhost:5001/api/appointments/doctor`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch appointments");
      
          const data = await res.json();
          if (Array.isArray(data)) {
            setBookedSlots(data);  // ✅ Only set if it's an array
          } else {
            console.error("Unexpected data format for booked slots:", data);
            setBookedSlots([]);  // ✅ Fallback to empty array
          }
        } catch (error) {
          console.error("Error fetching booked slots:", error);
          setBookedSlots([]);  // ✅ Prevent `.some()` issues
        }
      };
      
      const fetchRelatedDoctors = async () => {
        try {
          const allDoctors = await doctorService.fetchAllDoctors();  
          const filteredDoctors = allDoctors.doctors.filter(
            (doc: { speciality: string; _id: string }) =>
              doc.speciality === doctor.speciality && doc._id !== doctor._id
          );
          setRelatedDoctors(filteredDoctors);
        } catch (error) {
          console.error("Error fetching related doctors:", error);
        }
      };
      
      fetchBookedSlots();
      fetchRelatedDoctors();
    }
  }, [doctor, token]);

// Update your handleBooking function to use the slot ID
const handleBooking = async () => {
  if (!selectedDate || !selectedSlotTime || !selectedSlotId) {
    toast.warn("Please select a valid date and time slot");
    return;
  }
  
  if (!user?._id || !doctor?._id) {
    toast.error("User or Doctor details not available.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5001/api/appointments/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        patientId: user._id,
        doctorId: doctor._id,
        slotId: selectedSlotId,  // Now sending the actual slot ID
        date: selectedDate,
        time: selectedSlotTime,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Appointment booked successfully!");
      setBookedSlots((prevSlots) => [
        ...prevSlots,
        { date: selectedDate, time: selectedSlotTime, doctorName: doctor.name }
      ]);
      navigate("/myAppointments");
    } else {
      toast.error(data.message || "Failed to book appointment");
    }
  } catch (error) {
    console.error("Error booking appointment:", error);
    toast.error("An error occurred while booking. Please try again.");
  }
};

const handleChatNavigation = () => {
  if (user?._id && doctor?._id) {
    navigate(`/chats/${user._id}/${doctor._id}`);
  } else {
    navigate(`/chats`);
  }
};
  

  if (isLoading) return (
    <div className="container mx-auto p-8 flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
        <p className="text-xl text-gray-700">Loading doctor details...</p>
      </div>
    </div>
  );

  if (!doctor) return (
    <div className="container mx-auto p-8 text-center">
      <p className="text-xl text-red-500">Doctor not found or error loading details.</p>
      <button 
        onClick={() => navigate('/doctors')}
        className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors text-lg"
      >
        Back to Doctors
      </button>
    </div>
  );


  // ✅ Function to generate filtered time slots in AM/PM format
  const generateTimeSlots = (selectedDate: string, bookedSlots: { date: string; time: string }[]) => {
    const now = dayjs(); // Current date & time
    const isToday = selectedDate === now.format("YYYY-MM-DD"); // Check if selected date is today
  
    const timeSlots: string[] = [];
    for (let hour = 8; hour < 20; hour++) {
      const time24 = `${hour}:00`;
      const timeAMPM = dayjs(`${selectedDate} ${time24}`).format("h:mm A");
  
      // ✅ Exclude past slots if the selected date is today
      if (!isToday || dayjs(`${selectedDate} ${time24}`).isAfter(now)) {
        if (!bookedSlots.some((slot) => slot.date === selectedDate && slot.time === time24)) {
          timeSlots.push(timeAMPM); // ✅ Add AM/PM format
        }
      }
    }
    return timeSlots;
  };
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate, bookedSlots) : [];
    
  return (
    <div className="container mx-auto p-8">
      {/* Main doctor details card */}
      <div className="bg-white rounded-xl shadow-xl p-8 mb-10">
        <div className="flex flex-col md:flex-row items-center mb-8 gap-6">
          {doctor.imageUrl ? (
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-md"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-3xl font-bold shadow-md">
              {doctor.name.charAt(0)}
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800">{doctor.name}</h1>
            <p className="text-2xl text-blue-600 mt-2">{doctor.speciality}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-lg">
                {doctor.degree}
              </span>
              <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-lg">
                {doctor.experience} years exp.
              </span>
              <span
      className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-lg cursor-pointer"
      onClick={handleChatNavigation}
    >
      Chat with Doctor
    </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Professional Details</h3>
            <div className="space-y-3 text-lg">
              <p className="flex items-center text-gray-700">
                <span className="font-semibold w-32">Experience:</span> 
                <span>{doctor.experience} years</span>
              </p>
              <p className="flex items-center text-gray-700">
                <span className="font-semibold w-32">Degree:</span> 
                <span>{doctor.degree}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <span className="font-semibold w-32">Location:</span> 
                <span>{doctor.address}</span>
              </p>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">About</h3>
            <p className="text-gray-700 text-lg leading-relaxed">{doctor.about}</p>
          </div>
        </div>

        {doctor?.available && (
  <div className="bg-blue-50 p-6 rounded-xl shadow-md">
    <h3 className="text-2xl font-bold mb-6 text-blue-800 border-b border-blue-200 pb-2">
      Book Appointment
    </h3>
    <div className="space-y-6">
      <div>
        <label className="block text-gray-700 text-lg font-medium mb-2">
          Select Date:
        </label>
        <input
          type="date"
          min={new Date(new Date().setDate(new Date().getDate())).toISOString().split('T')[0]}
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedSlotId("");
            setSelectedSlotTime("");
          }}
          className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
      </div>
      
      {selectedDate && (
        <TimeSlotSelector
          doctorId={doctor._id}
          token={token}
          selectedDate={selectedDate}
          bookedAppointments={bookedSlots}
          onSelectSlot={(slotId, time, price) => {
            setSelectedSlotId(slotId);
            setSelectedSlotTime(time);
            setSelectedSlotPrice(price);
          }}
        />
      )}
      
      {selectedSlotId && selectedSlotTime && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-lg text-green-800">Selected Appointment</h4>
          <p className="text-gray-700">Date: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-gray-700">Time: {dayjs(`2000-01-01 ${selectedSlotTime}`).format('h:mm A')}</p>
          <p className="text-gray-700">Price: ₹{selectedSlotPrice}</p>
        </div>
      )}
    </div>
    <button
      onClick={handleBooking}
      disabled={!selectedDate || !selectedSlotId || !selectedSlotTime}
      className={`mt-6 px-8 py-3 rounded-lg text-white text-lg font-semibold transition-colors ${
        !selectedDate || !selectedSlotId || !selectedSlotTime
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      Book Appointment
    </button>
  </div>
)}


{/* Show alert if doctor is unavailable */}
{!doctor?.available && (
  <p className="text-red-600 text-lg font-bold mt-4">
    Doctor is currently unavailable for appointments.
  </p>
)}
      </div>

      {/* Reviews Section */}
      {doctor && (
        <DoctorReviews
          doctorId={doctor._id}
          token={token}
        />
      )}

      {/* Related doctors section - moved outside the main card and made larger */}
      {relatedDoctors.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-3">Related Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedDoctors.map((relatedDoctor) => (
              <div
                key={relatedDoctor._id}
                className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-md transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  {relatedDoctor.imageUrl ? (
                    <img
                      src={relatedDoctor.imageUrl}
                      alt={relatedDoctor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold">
                      {relatedDoctor.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-xl">{relatedDoctor.name}</h4>
                    <p className="text-blue-600 text-lg">{relatedDoctor.speciality}</p>
                  </div>
                </div>
                <div className="mb-4 text-gray-700">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {relatedDoctor.degree}
                    </span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                      {relatedDoctor.experience} years exp.
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 flex items-center gap-2 truncate">
                    <FaMapMarkerAlt className="text-red-500" /> {relatedDoctor.address}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/doctors/${relatedDoctor._id}`)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium text-lg transition-colors"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;