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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    
    // Automatically upload the image when a file is selected
    const imageFormData = new FormData();
    imageFormData.append("image", file);
    
    // Include all other doctor data
    Object.keys(formData).forEach(key => {
      if (key !== 'image') {
        imageFormData.append(key, formData[key]);
      }
    });

    setIsUploadingImage(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${doctor._id}`, {
        method: "PUT",
        body: imageFormData,
      });

      if (!response.ok) {
        throw new Error("Failed to update doctor image");
      }

      const data = await response.json();
      setDoctor(data);
      setFormData(data);
    } catch (error) {
      console.error("Error updating doctor image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${doctor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          speciality: formData.speciality,
          degree: formData.degree,
          experience: formData.experience,
          address1: formData.address1,
          address2: formData.address2,
          about: formData.about,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to update details");
      }
  
      setDoctor({ ...doctor, ...formData });
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
        <div className="flex flex-col items-center space-y-6">
          <img
            src={image ? URL.createObjectURL(image) : `http://localhost:5000${doctor.image}`}
            alt="Doctor"
            className="w-72 h-72 object-cover rounded-2xl border-4 border-gray-300"
          />
          {isEditing && (
            <div className="mt-8">
              <label 
                htmlFor="fileInput" 
                className="bg-blue-600 text-white px-8 py-4 text-2xl rounded-2xl cursor-pointer"
              >
                {isUploadingImage ? "Uploading..." : "Change Image"}
              </label>
              <input 
                type="file" 
                id="fileInput" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-10">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-5 text-2xl rounded-2xl"
              placeholder="Name"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full border p-5 text-2xl bg-gray-200 rounded-2xl"
            />

            <select
              name="speciality"
              value={formData.speciality}
              onChange={handleChange}
              className="w-full border p-5 text-2xl rounded-2xl"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              className="w-full border p-5 text-2xl rounded-2xl"
              placeholder="Degree"
            />

            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="1"
              className="w-full border p-5 text-2xl rounded-2xl"
              placeholder="Experience (Years)"
            />

            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              className="w-full border p-5 text-2xl rounded-2xl"
              placeholder="Address Line 1"
            />

            <input
              type="text"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              className="w-full border p-5 text-2xl rounded-2xl"
              placeholder="Address Line 2"
            />

            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              className="w-full border p-5 text-2xl rounded-2xl"
              placeholder="About"
            />

            <div className="flex gap-12 justify-center">
              <button type="submit" className="bg-green-600 text-white px-10 py-5 text-2xl rounded-2xl">
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(doctor);
                  setImage(null);
                }}
                className="bg-gray-600 text-white px-10 py-5 text-2xl rounded-2xl"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-2xl">
            <h3 className="text-4xl font-semibold text-center">{doctor.name}</h3>
            <p className="text-center">{doctor.degree} - {doctor.speciality}</p>
            <p className="text-center"><strong>Experience:</strong> {doctor.experience} Years</p>
            <p className="text-center"><strong>About:</strong> {doctor.about}</p>
            <p className="text-center"><strong>Address:</strong> {doctor.address1}, {doctor.address2}</p>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-10 py-5 text-2xl rounded-2xl"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;