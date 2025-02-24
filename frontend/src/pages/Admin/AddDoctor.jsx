import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddDoctor = () => {
  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    speciality: "",
    degree: "",
    experience: "",
    address: "",
    about: "",
    available: "true", // Default to "true"
    appointmentfee: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
    Object.keys(doctor).forEach((key) => formData.append(key, doctor[key]));
    if (selectedFile) formData.append("image", selectedFile);
  
    try {
      const { data } = await axios.post("http://localhost:5000/api/doctors/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      toast.success(data.message || "Doctor added successfully. Email sent!");
  
      setDoctor({
        name: "",
        email: "",
        speciality: "",
        degree: "",
        experience: "",
        address: "",
        about: "",
        available: "true",
        appointmentfee: "",
      });
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add Doctor</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="name" placeholder="Doctor Name" value={doctor.name} onChange={handleChange} required className="p-2 border rounded w-full mb-3" />
        <input type="email" name="email" placeholder="Doctor Email" value={doctor.email} onChange={handleChange} required className="p-2 border rounded w-full mb-3" />
        <select 
  name="speciality" 
  value={doctor.speciality} 
  onChange={handleChange} 
  required 
  className="p-2 border rounded w-full mb-3"
>
  <option value="" disabled>Select Speciality</option>
  {["General", "Gynecologist", "Dermatologist", "Pediatrician", "Neurologist", "Gastroenterologist"].map((spec) => (
    <option key={spec} value={spec}>{spec}</option>
  ))}
</select>
        <input type="text" name="degree" placeholder="Degree" value={doctor.degree} onChange={handleChange} required className="p-2 border rounded w-full mb-3" />
        <input type="number" name="experience" placeholder="Years of Experience" value={doctor.experience} onChange={handleChange} required min={1} className="p-2 border rounded w-full mb-3" />
        <input type="text" name="address" placeholder="Address" value={doctor.address} onChange={handleChange} required className="p-2 border rounded w-full mb-3" />
        <textarea name="about" placeholder="About Doctor" value={doctor.about} onChange={handleChange} required className="p-2 border rounded w-full mb-3"></textarea>

        {/* Availability Dropdown */}
        <select name="available" value={doctor.available} onChange={handleChange} required className="p-2 border rounded w-full mb-3">
          <option value="true">Available</option>
          <option value="false">Not Available</option>
        </select>

        <input type="number" name="appointmentfee" placeholder="Appointment Fee" 
  value={doctor.appointmentfee} onChange={handleChange} required className="p-2 border rounded w-full mb-3" />

        <input type="file" accept="image/*" onChange={handleFileChange} className="p-2 border rounded w-full mb-3" />

        <button type="submit" className="bg-blue-600 text-white p-3 rounded w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Doctor"}
        </button>
      </form>
    </div>
  );
};

export default AddDoctor;
