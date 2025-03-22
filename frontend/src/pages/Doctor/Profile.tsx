import { useState, useEffect, useRef } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doctorService } from "../../services/doctorService";
import React from "react";
import axios from "axios";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  speciality: string;
  degree: string;
  experience: number;
  address: string;
  available: boolean;
  imageUrl: string;
  about: string;
}

interface FormData {
  name: string;
  speciality: string;
  degree: string;
  experience: number;
  address: string;
  available: boolean;
  imageUrl?: string;
  about: string;
}

interface Speciality {
  _id: string;
  name: string;
}

const DoctorProfile: React.FC = () => {
  // State management
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [image, setImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cropping related states
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch specialities
  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/admin/specialities");
        setSpecialities(response.data);
      } catch (error) {
        toast.error("Failed to fetch specialities.");
        setError("Could not load specialities. Please try again later.");
      }
    };
    fetchSpecialities();
  }, []);

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctorData = async () => {
      setIsLoading(true);
      try {
        const response = await doctorService.fetchDoctor();
        setDoctor(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        setError("Could not load your profile. Please try again later.");
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctorData();
  }, []);
      
  // Effect to update the preview canvas when crop changes
  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio;
    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
  }, [completedCrop]);

  // Generate a cropped image file
  const getCroppedImg = async (image: HTMLImageElement, crop: Crop, fileName: string): Promise<Blob | null> => {
    if (!crop || !image) return null;

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            resolve(null);
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.95 // Image quality
      );
    });
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;

    // Calculate the starting position centered in the image
    const cropWidth = Math.min(naturalWidth, naturalHeight);
    const cropX = (naturalWidth - cropWidth) / 2;
    const cropY = (naturalHeight - cropWidth) / 2;

    setCrop({
      unit: "px",
      width: cropWidth,
      height: cropWidth,
      x: cropX,
      y: cropY,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setFormData({ ...formData, available: !formData.available });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCropping(true);
    const reader = new FileReader();
    reader.addEventListener("load", () => setSrcImage(reader.result as string));
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setSrcImage(null);
    setCrop({
      unit: "%",
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    });
  };

  const handleCropApply = async () => {
    if (!imgRef.current || !completedCrop) {
      console.error("Image reference or crop data is missing");
      return;
    }
  
    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        "cropped.jpg"
      );
  
      if (!croppedImageBlob) {
        throw new Error("Failed to create cropped image");
      }
  
      const croppedImageFile = new File([croppedImageBlob], "cropped.jpg", { type: "image/jpeg" });
  
      setImage(croppedImageFile);
      uploadImage(croppedImageFile);
  
      setIsCropping(false);
      setSrcImage(null);
    } catch (e) {
      console.error("Error applying crop:", e);
      toast.error("Failed to crop image. Please try again.");
    }
  };
  
  const uploadImage = async (imageFile: File) => {
    setIsUploadingImage(true);
    try {
      const data = await doctorService.uploadImage(doctor!._id, imageFile);
      setDoctor({ ...doctor!, imageUrl: data.imageUrl });
      setFormData({ ...formData, imageUrl: data.imageUrl });
      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };
    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const profileData = {
        name: formData.name,
        speciality: formData.speciality,
        degree: formData.degree,
        experience: formData.experience,
        address: formData.address,
        available: formData.available,
        about: formData.about
      };
  
      const updatedDoctor = await doctorService.updateProfile(doctor!._id, profileData);
  
      if (!updatedDoctor) {
        throw new Error("Failed to update doctor details");
      }
  
      setDoctor((prevDoctor) => ({
        ...prevDoctor!,
        ...profileData,
      }));
  
      setFormData((prevFormData) => ({
        ...prevFormData!,
        ...profileData,
      }));
  
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating doctor details:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-3xl font-bold text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-12 bg-white shadow-xl rounded-lg max-w-2xl">
          <div className="w-32 h-32 mx-auto mb-8 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-4xl font-bold text-gray-800 mb-4">Something went wrong</h3>
          <p className="text-2xl text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-12 py-4 bg-blue-600 text-white text-2xl font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!doctor) return null; // Fallback in case doctor is null after loading

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8 bg-blue-600 text-white py-2">
        <h2 className="text-5xl font-bold text-center">Doctor Profile</h2>
      </div>

      {/* Main Content */}
      <div className="w-full px-4">
        <div className="bg-white shadow-xl overflow-hidden">
          {/* Image Cropping Modal */}
          {isCropping && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-lg w-full max-w-6xl max-h-screen overflow-auto">
                <h3 className="text-3xl font-bold mb-6 text-gray-900">Adjust Profile Photo</h3>

                <div className="flex flex-col items-center space-y-8">
                  <ReactCrop
                    crop={crop}
                    onChange={setCrop}
                    onComplete={handleCropComplete}
                    circularCrop
                    keepSelection
                    aspect={1} 
                    className="max-h-screen mx-auto"
                  >
                    <img
                      ref={imgRef}
                      src={srcImage!}
                      alt="Crop preview"
                      className="max-h-screen"
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>

                  <div className="w-full">
                    <p className="mb-2 text-2xl font-medium text-gray-700">Preview:</p>
                    <canvas
                      ref={previewCanvasRef}
                      className="max-w-full mx-auto border-4 border-gray-300 rounded-full"
                      style={{
                        width: Math.round(completedCrop?.width ?? 0),
                        height: Math.round(completedCrop?.height ?? 0),
                      }}
                    />
                  </div>

                  <div className="flex justify-center gap-6 w-full">
                    <button
                      onClick={handleCropCancel}
                      className="px-10 py-4 border-2 border-gray-300 text-2xl text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCropApply}
                      className="px-10 py-4 bg-blue-600 text-white text-2xl rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Apply Crop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Header with Image */}
          <div className="py-8 border-b-4 border-gray-200 flex flex-col items-center">
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0 relative group mb-6">
                <img
                  src={image ? URL.createObjectURL(image) : doctor.imageUrl}
                  alt={`Dr. ${doctor.name}`}
                  className="h-64 w-64 rounded-full object-cover border-8 border-white shadow-xl"
                />
                {isEditing && (
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                    <label className="cursor-pointer opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-6 py-3 rounded-full text-2xl font-medium">
                      {isUploadingImage ? "Uploading..." : "Change Photo"}
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-4xl font-bold text-gray-900 w-full border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none pb-1 text-center"
                    placeholder="Your Name"
                  />
                ) : (
                  <h3 className="text-4xl font-bold text-gray-900">{doctor.name}</h3>
                )}
                <div className="mt-2 text-xl text-gray-600">
                  {doctor.email}
                </div>
                <div className="mt-3 flex items-center justify-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-xl font-medium ${doctor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {doctor.available ? 'Available' : 'Not Available'}
                  </span>
                  <span className="ml-4 text-xl text-gray-500">
                    {doctor.degree} • {doctor.experience} Years Experience
                  </span>
                </div>
              </div>
              
              {!isEditing && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setFormData(doctor);
                    }}
                    className="inline-flex items-center px-8 py-4 border border-transparent rounded-xl shadow-lg text-2xl font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  >
                    <svg className="-ml-1 mr-3 h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="speciality" className="block text-xl font-medium text-gray-700 mb-2">
                    Speciality
                  </label>
                  <select
                    id="speciality"
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    className="w-full p-4 text-2xl border-2 border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>Select Speciality</option>
                    {specialities.map((spec) => (
                      <option key={spec._id} value={spec.name}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="degree" className="block text-xl font-medium text-gray-700 mb-2">
                    Degree
                  </label>
                  <input
                    id="degree"
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full p-4 text-2xl border-2 border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. MD, MBBS"
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-xl font-medium text-gray-700 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    id="experience"
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-4 text-2xl border-2 border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Years of experience"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-xl font-medium text-gray-700 mb-2">
                    Practice Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-4 text-2xl border-2 border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your clinic/hospital address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="about" className="block text-xl font-medium text-gray-700 mb-2">
                  About
                </label>
                <textarea
                  id="about"
                  name="about"
                  rows={5}
                  value={formData.about}
                  onChange={handleChange}
                  className="w-full p-4 text-2xl border-2 border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell patients about your expertise, approach, and experience"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="available"
                  type="checkbox"
                  checked={formData.available}
                  onChange={handleToggle}
                  className="h-8 w-8 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="available" className="ml-4 block text-2xl text-gray-700">
                  Available for  patients
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-center gap-6 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(doctor);
                    setImage(null);
                  }}
                  className="px-12 py-6 border-2 border-gray-300 rounded-xl shadow-lg text-2xl font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-12 py-6 border-2 border-transparent rounded-xl shadow-lg text-2xl font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h4 className="text-3xl font-semibold text-gray-800 mb-6">Professional Details</h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <dt className="text-xl font-medium text-gray-500">Speciality</dt>
                      <dd className="mt-2 text-2xl text-gray-900">{doctor.speciality}</dd>
                    </div>
                    <div>
                      <dt className="text-xl font-medium text-gray-500">Degree</dt>
                      <dd className="mt-2 text-2xl text-gray-900">{doctor.degree}</dd>
                    </div>
                    <div>
                      <dt className="text-xl font-medium text-gray-500">Experience</dt>
                      <dd className="mt-2 text-2xl text-gray-900">{doctor.experience} Years</dd>
                    </div>
                    <div>
                      <dt className="text-xl font-medium text-gray-500">Practice Address</dt>
                      <dd className="mt-2 text-2xl text-gray-900">{doctor.address}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h4 className="text-3xl font-semibold text-gray-800 mb-6">About Me</h4>
                  <p className="text-2xl text-gray-900 whitespace-pre-wrap">{doctor.about}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;