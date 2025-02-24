import { useState, useEffect } from "react";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [image, setImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const specializations = [
    "General",
    "Gynecologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Gastroenterologist"
  ];

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/doctors/doctor");
        const data = await response.json();
        setDoctor(data);
        setFormData(data);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      }
    };
    fetchDoctor();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = doctor.image;
      if (image) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append("image", image);

        const imageResponse = await fetch("http://localhost:5000/api/doctors/${doctor._id}", {
          method: "PUT",
          body: formData,
        });
        const imageData = await imageResponse.json();
        imageUrl = imageData.imageUrl;
        setIsUploadingImage(false);
      }

      const response = await fetch(`http://localhost:5000/api/doctors/${doctor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update details");
      }

      setDoctor({ ...doctor, ...formData, image: imageUrl });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating doctor details:", error);
    }
  };

  if (!doctor) return <p className="text-xl font-bold text-center">Loading...</p>;

  return (
    <div className="p-16 space-y-8">
      <h2 className="text-5xl font-bold mb-10 text-center">Doctor Profile</h2>
      <div className="bg-white shadow-xl p-12 rounded-2xl max-w-4xl mx-auto space-y-10">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="text-center">
              <img
                src={image ? URL.createObjectURL(image) : doctor.image ? `http://localhost:5000${doctor.image}` : "https://via.placeholder.com/180"}
                alt="Doctor"
                className="w-48 h-48 mx-auto rounded-full object-cover"
              />
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-4" />
            </div>
            
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-5 text-2xl rounded-2xl" placeholder="Name" />
            
            <select name="speciality" value={formData.speciality} onChange={handleChange} className="w-full border p-5 text-2xl rounded-2xl">
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <input type="text" name="degree" value={formData.degree} onChange={handleChange} className="w-full border p-5 text-2xl rounded-2xl" placeholder="Degree" />
            <input type="number" name="experience" value={formData.experience} onChange={handleChange} min="1" className="w-full border p-5 text-2xl rounded-2xl" placeholder="Experience (Years)" />
            <input type="text" name="address1" value={formData.address} onChange={handleChange} className="w-full border p-5 text-2xl rounded-2xl" placeholder="Address Line 1" />
            <textarea name="about" value={formData.about} onChange={handleChange} className="w-full border p-5 text-2xl rounded-2xl" placeholder="About" />
            <input type="text" name="available" value={formData.available} onChange={handleChange} className="w-full border p-5 text-2xl rounded-2xl" placeholder="Available (Yes/No)" />
            <input type="number" name="appointmentFee" value={formData.appointmentfee} onChange={handleChange} className="w-full border p-5 text-2xl rounded-2xl" placeholder="Appointment Fee" />

            <div className="flex gap-12 justify-center">
              <button type="submit" className="bg-green-600 text-white px-10 py-5 text-2xl rounded-2xl">{isUploadingImage ? "Uploading..." : "Save"}</button>
              <button type="button" onClick={() => { setIsEditing(false); setFormData(doctor); }} className="bg-gray-600 text-white px-10 py-5 text-2xl rounded-2xl">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-2xl text-center">
            <img src={doctor.image ? `http://localhost:5000${doctor.image}` : "https://via.placeholder.com/180"} alt="Doctor" className="w-48 h-48 mx-auto rounded-full object-cover" />
            <h3 className="text-4xl font-semibold">{doctor.name}</h3>
            <p>{doctor.degree} - {doctor.speciality}</p>
            <p><strong>Experience:</strong> {doctor.experience} Years</p>
            <p><strong>About:</strong> {doctor.about}</p>
            <p><strong>Address:</strong> {doctor.address1}, {doctor.address2}</p>
            <p><strong>Available:</strong> {doctor.available}</p>
            <p><strong>Appointment Fee:</strong> ₹{doctor.appointmentfee}</p>
            <div className="flex justify-center mt-10">
              <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-10 py-5 text-2xl rounded-2xl">Edit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;