import React, { useState, useEffect } from "react";
import { BsSearch } from "react-icons/bs";
import { FaUserMd, FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaStethoscope, FaTimes } from "react-icons/fa";
import { doctorService } from "../../services/doctorService";
import { updateDoctorStatus } from "../../redux/slices/doctorSlice";
import { useDispatch } from "react-redux";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useRef } from "react";
import axios from "axios";
import { adminService } from "../../services/adminSevice";

interface Doctor {
  status: string;
  _id: string;
  name: string;
  speciality: string;
  degree: string;
  experience: string;
  address: string;
  appointmentFee: number;
  available: boolean;
  isBlocked: boolean;
  blockReason?: string;
  imageUrl?: string;
  image?: File | Blob | null;
}

interface Crop {
  unit: "%" | "px";
  x: number;
  y: number;
  width: number;
  height: number;
}

const DoctorListSidebar: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const doctorsPerPage: number = 9;
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const specialities = await adminService.fetchSpecialities();
        const allSpecializations = specialities.map((spec: { name: string }) => spec.name);
        setSpecializations(allSpecializations);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    };
  
    fetchSpecializations();
  }, []);
  

  // Image cropping states
  const [isCropping, setIsCropping] = useState(false);
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const fetchDoctorsData = async () => {
      try {
        const doctorsData = await doctorService.fetchAllDoctors();
        const filteredDoctors = doctorsData.doctors.filter(
          (doctor: Doctor) => doctor.status !== "rejected"
        ); // ✅ Exclude rejected doctors
        setDoctors(filteredDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctorsData();
  }, []);

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const openModal = (doctor: Doctor): void => {
    setSelectedDoctor({ ...doctor });
  };

  const closeModal = (): void => {
    setSelectedDoctor(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (selectedDoctor) {
      setSelectedDoctor({ ...selectedDoctor, [e.target.name]: e.target.value });
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    setSelectedDoctor((prev) =>
      prev ? { ...prev, [name]: value } : null
    );
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCropping(true);
    const reader = new FileReader();
    reader.addEventListener("load", () => setSrcImage(reader.result as string));
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
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

  const getCroppedImg = async (image: HTMLImageElement, crop: Crop): Promise<Blob | null> => {
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
        0.95
      );
    });
  };

  const handleCropApply = async () => {
    if (!imgRef.current || !completedCrop || !selectedDoctor) {
      console.error("Image reference, crop data, or selected doctor is missing");
      return;
    }

    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);

      if (!croppedImageBlob) {
        throw new Error("Failed to create cropped image");
      }

      const croppedImageFile = new File([croppedImageBlob], "cropped.jpg", { type: "image/jpeg" });
      setSelectedDoctor({ ...selectedDoctor, image: croppedImageFile });
      setIsCropping(false);
      setSrcImage(null);
    } catch (e) {
      console.error("Error applying crop:", e);
    }
  };

  const handleAdminEdit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
  
    if (!selectedDoctor || !selectedDoctor._id) {
      console.error('No doctor selected or missing ID');
      return;
    }
  
    try {
      const formDataToSend = new FormData();
  
      Object.entries(selectedDoctor).forEach(([key, value]) => {
        if (
          key !== 'image' &&
          key !== 'imageUrl' &&
          key !== '_id' &&
          value !== null &&
          value !== undefined
        ) {
          formDataToSend.append(key, value.toString());
        }
      });
  
      if (selectedDoctor.image && selectedDoctor.image instanceof File) {
        formDataToSend.append('image', selectedDoctor.image);
      }
  
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Authentication token not found');
  
      const response = await doctorService.updateDoctorProfile(
        selectedDoctor._id,
        token,
        formDataToSend
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update doctor');
      }
  
      const responseData = await response.json();
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid response format from server');
      }
  
      const updatedDoctor = {
        ...selectedDoctor,
        ...responseData
      };
  
      if (!updatedDoctor._id || !updatedDoctor.name || !updatedDoctor.speciality) {
        throw new Error('Critical doctor data missing after update');
      }
  
      setDoctors(prevDoctors =>
        prevDoctors.map(doc =>
          doc._id === updatedDoctor._id ? updatedDoctor : doc
        )
      );
  
      closeModal();
      toast.success('Doctor profile updated successfully!');
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update doctor');
    }
  };

  
  const handleToggleBlock = async (): Promise<void> => {
    if (!selectedDoctor || !selectedDoctor._id) {
      console.error('No selected doctor or missing ID');
      return;
    }
  
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Authentication token not found');
  
      const newBlockStatus = !selectedDoctor.isBlocked;
      const formData = new FormData();
      formData.append('isBlocked', newBlockStatus.toString());
  
      const response = await doctorService.updateDoctorProfile(
        selectedDoctor._id,
        token,
        formData
      );
  
      const responseData = await response.json();
      console.log('Response from toggle block:', responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update block status');
      }
  
      const updatedDoctor = responseData?.doctor || responseData;
  
      if (!updatedDoctor || !updatedDoctor._id) {
        throw new Error('Invalid doctor data in response');
      }
  
      setSelectedDoctor(updatedDoctor);
      setDoctors(prevDoctors =>
        prevDoctors.map(doc =>
          doc._id === updatedDoctor._id ? updatedDoctor : doc
        )
      );
  
      toast.success(`Doctor has been ${updatedDoctor.isBlocked ? 'blocked' : 'unblocked'}`);
    } catch (error) {
      console.error('Error toggling block status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update block status');
    }
  };
  
  
  const handleApproval = async (doctorId: string, status: string) => {
    try {
      await doctorService.approveDoctor(doctorId, status);
  
      if (status === "approved") {
        dispatch(updateDoctorStatus("approved"));
        localStorage.setItem("doctorStatus", "approved");
  
        setDoctors((prevDoctors) =>
          prevDoctors.map((doctor) =>
            doctor._id === doctorId ? { ...doctor, status: "approved" } : doctor
          )
        );
      } else {
        // ✅ Remove rejected doctors from UI immediately
        setDoctors((prevDoctors) =>
          prevDoctors.filter((doctor) => !(doctor._id === doctorId && status === "rejected"))
        );
      }
  
      toast.success(`Doctor ${status} successfully!`);
    } catch (error) {
      console.error("Error approving/rejecting doctor:", error);
      toast.error("Failed to update doctor status.");
    }
  };
  
  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentDoctors.length > 0 ? (
          currentDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="w-72 h-96 bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openModal(doctor)}
            >
              <div className="w-full h-2/3 bg-gray-200">
                <img
                  src={doctor.imageUrl ? doctor.imageUrl : "https://via.placeholder.com/180"}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-1/3 p-4 bg-gray-100 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-1">{doctor.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <FaStethoscope className="inline mr-1" />
                  {doctor.speciality}
                </p>
                <div className="flex items-center justify-center mt-2">
                  {doctor.status === "pending" ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproval(doctor._id, "approved"); // ✅ Accept Button
                        }}
                        className="bg-green-500 text-white px-5 py-1 text-lg font-bold rounded-lg shadow-lg hover:bg-green-600 
                                  hover:scale-105 transition-all duration-300 border-4 border-green-700 animate-pulse"
                      >
                        Accept
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproval(doctor._id, "rejected"); // ❌ Reject Button
                        }}
                        className="bg-red-500 text-white px-5 py-1 text-lg font-bold rounded-lg shadow-lg hover:bg-red-600 
                                  hover:scale-105 transition-all duration-300 border-4 border-red-700 animate-pulse"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(doctor); // ✅ Edit Button
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm mr-2 hover:bg-blue-600"
                      >
                        Edit
                      </button>

                      <div
                        className={`px-3 py-1 rounded-md text-sm ${doctor.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                      >
                        {doctor.available ? 'Available' : 'Not Available'}
                      </div>
                      {doctor.isBlocked && (
                        <div className="px-3 py-1 mx-2 rounded-md text-sm bg-red-500 text-white">
                          Blocked
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No doctors found</p>
        )}
      </div>

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

      {selectedDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          {isCropping ? (
            <div className="bg-white p-8 rounded-xl max-w-4xl w-full max-h-screen overflow-auto">
              <h3 className="text-2xl font-bold mb-4">Crop Doctor's Image</h3>
              <div className="flex flex-col items-center">
                <ReactCrop
                  crop={crop}
                  onChange={setCrop}
                  onComplete={handleCropComplete}
                  circularCrop
                  keepSelection
                  aspect={1}
                  className="max-h-96 mx-auto"
                >
                  <img
                    ref={imgRef}
                    src={srcImage!}
                    alt="Crop preview"
                    className="max-h-96"
                    onLoad={onImageLoad}
                  />
                </ReactCrop>

                <div className="mt-4 w-full">
                  <p className="mb-2 font-medium">Preview:</p>
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full mx-auto border rounded-lg"
                    style={{
                      width: Math.round(completedCrop?.width ?? 0),
                      height: Math.round(completedCrop?.height ?? 0),
                    }}
                  />
                </div>

                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={handleCropCancel}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg text-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropApply}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-xl"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-3xl font-bold text-gray-800">Edit Doctor</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8 mb-6">
                <div className="md:w-1/3 flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 shadow-md mb-4">
  <img
    src={
      selectedDoctor.image instanceof File || selectedDoctor.image instanceof Blob
        ? URL.createObjectURL(selectedDoctor.image)
        : selectedDoctor.imageUrl || "https://via.placeholder.com/300"
    }
    alt={selectedDoctor.name}
    className="w-full h-full object-cover"
  />
  <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg">
    <input
      type="file"
      accept="image/*"
      name="image"
      onChange={handleFileChange}
      className="hidden"
    />
    {isUploadingImage ? "Uploading..." : "Change"}
  </label>
</div>                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`py-1 px-3 rounded-full text-sm font-semibold ${selectedDoctor.available ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {selectedDoctor.available ? 'Available' : 'Unavailable'}
                      </span>
                      <span className={`py-1 px-3 rounded-full text-sm font-semibold ${selectedDoctor.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {selectedDoctor.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                    <button
                      onClick={handleToggleBlock}
                      className={`w-full py-2 text-sm rounded-lg ${selectedDoctor.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors shadow-md`}
                    >
                      {selectedDoctor.isBlocked ? 'Unblock Doctor' : 'Block Doctor'}
                    </button>
                  </div>
                </div>

                <div className="md:w-2/3 space-y-4">
                  <div className="form-group">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      <FaUserMd className="inline-block mr-2 text-blue-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={selectedDoctor.name}
                      onChange={handleInputChange}
                      className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

            <select
              name="speciality"
              value={selectedDoctor.speciality}
              onChange={handleSelectChange}
              className="w-full border p-5 text-2xl rounded-2xl"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>                 

                  <div className="form-group">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      <FaGraduationCap className="inline-block mr-2 text-blue-500" />
                      Degree
                    </label>
                    <input
                      type="text"
                      name="degree"
                      value={selectedDoctor.degree}
                      onChange={handleInputChange}
                      className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      <FaBriefcase className="inline-block mr-2 text-blue-500" />
                      Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={selectedDoctor.experience}
                      onChange={handleInputChange}
                      className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline-block mr-2 text-blue-500" />
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={selectedDoctor.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      Availability
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedDoctor?.available ?? false}
                        onChange={(e) =>
                          setSelectedDoctor((prev) =>
                            prev ? { ...prev, available: e.target.checked } : null
                          )
                        }
                        className="w-5 h-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                      />
                      <span>{selectedDoctor?.available ? "Available" : "Not Available"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 mt-6 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 text-lg font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdminEdit(e as unknown as React.FormEvent<HTMLFormElement>);
                  }}
                  className="w-full py-3 text-lg bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorListSidebar;