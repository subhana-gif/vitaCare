import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddDoctor = () => {
  const [doctor, setDoctor] = useState({ name: "", email: "", speciality: "", degree: "", experience: "", address1: "", address2: "", about: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setDoctor({ ...doctor, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(doctor).forEach((key) => formData.append(key, doctor[key]));
    if (selectedFile) formData.append("image", selectedFile);

    try {
      const { data } = await axios.post("http://localhost:5000/api/doctors/add", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(data.message);
      setDoctor({ name: "", email: "", speciality: "", degree: "", experience: "", address1: "", address2: "", about: "" });
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
        <input type="file" accept="image/*" onChange={handleFileChange} className="p-2 border rounded w-full mb-3" />
        <button type="submit" className="bg-blue-600 text-white p-3 rounded w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Doctor"}
        </button>
      </form>
    </div>
  );
};

export default AddDoctor;
