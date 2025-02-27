import { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./utils/cropImage"; // Utility function to get cropped image

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/doctors/doctor", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await res.json();
        if (res.ok) {
          setDoctor(data);
          setFormData(data);
        } else {
          console.error("Error fetching doctor details:", data.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
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

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback(async (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    setCroppedImage(croppedImageBlob);
    setShowCropModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("speciality", formData.speciality);
      if (croppedImage) formDataToSend.append("image", croppedImage);

      const response = await fetch(`http://localhost:5000/api/doctors/${doctor._id}`, {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update details");

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
            src={croppedImage ? URL.createObjectURL(croppedImage) : `http://localhost:5000${doctor.image}`}
            alt="Doctor"
            className="w-72 h-72 object-cover rounded-2xl border-4 border-gray-300"
          />
          {isEditing && (
            <label className="bg-blue-600 text-white px-8 py-4 text-2xl rounded-2xl cursor-pointer">
              Change Image
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-10">
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-5 text-2xl rounded-2xl" placeholder="Name" />
            <input type="email" name="email" value={doctor.email} disabled className="w-full border p-5 text-2xl bg-gray-200 rounded-2xl" />
            <select name="speciality" value={formData.speciality} onChange={handleChange} className="w-full border p-5 text-2xl rounded-2xl">
              {["General", "Gynecologist", "Dermatologist", "Pediatrician", "Neurologist", "Gastroenterologist"].map(spec => <option key={spec} value={spec}>{spec}</option>)}
            </select>
            <div className="flex gap-12 justify-center">
              <button type="submit" className="bg-green-600 text-white px-10 py-5 text-2xl rounded-2xl">Save</button>
              <button type="button" onClick={() => { setIsEditing(false); setFormData(doctor); }} className="bg-gray-600 text-white px-10 py-5 text-2xl rounded-2xl">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6 text-2xl">
            <h3 className="text-4xl font-semibold">{doctor.name}</h3>
            <p>{doctor.degree} - {doctor.speciality}</p>
            <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-10 py-5 text-2xl rounded-2xl">Edit</button>
          </div>
        )}
      </div>

      {showCropModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-8 rounded-2xl space-y-6">
            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            <button onClick={handleCrop} className="bg-green-600 text-white px-10 py-5 text-2xl rounded-2xl">Crop</button>
            <button onClick={() => setShowCropModal(false)} className="bg-red-600 text-white px-10 py-5 text-2xl rounded-2xl">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
