import React, { useState, useCallback, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactCrop, { centerCrop, makeAspectCrop, Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { doctorService } from "../../services/doctorService";
import * as yup from "yup";
import { adminService } from "../../services/adminSevice";

interface DoctorFormData {
  name: string;
  email: string;
  speciality: string;
  degree: string;
  experience: string; 
  address: string;
  about: string;
  available: string;
  image?: File; 
}

const doctorSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  speciality: yup.string().required("Speciality is required"),
  degree: yup.string().required("Degree is required"),
  experience: yup
    .number()
    .typeError("Experience must be a number") 
    .required("Experience is required")
    .positive("Experience must be a positive number")
    .integer("Experience must be an integer"),
  address: yup.string().required("Address is required"),
  about: yup.string().required("About is required"),
  available: yup.string().required("Availability is required"),
});

interface Speciality {
  _id: string;
  name: string;
}

const AddDoctor: React.FC = () => {
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [doctor, setDoctor] = useState<DoctorFormData>({
    name: "",
    email: "",
    speciality: "",
    degree: "",
    experience: "", 
    address: "",
    about: "",
    available: "true",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Image and crop states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const data = await adminService.fetchSpecialities();
        setSpecialities(data);
      } catch (error) {
        toast.error("Failed to fetch specialities.");
      }
    };
    fetchSpecialities();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "experience") {
      const parsedValue = value === "" ? "" : String(Number(value)); // Ensure it's a string
      setDoctor({ ...doctor, [name]: parsedValue });
    } else {
      setDoctor({ ...doctor, [name]: value });
    }
    

    // Clear the error for the field being edited
    setErrors({ ...errors, [name]: "" });
  };

  // Initialize crop when image is loaded
  function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  // Handle image selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImgSrc(null);
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
      setShowCropper(true);
    });
    reader.readAsDataURL(file);
  };
  
  // Handle image load
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImgRef(e.currentTarget);
    
    // Initialize crop to a square aspect ratio (1:1)
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  // Function to create cropped image
  function getCroppedImg(image: HTMLImageElement, crop: Crop, fileName: string): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // As a blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            throw new Error('Canvas is empty');
          }
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  }

  // Apply crop and prepare for submission
  const applyCrop = async () => {
    if (!imgRef || !completedCrop) {
      return;
    }
    
    try {
      const croppedImage = await getCroppedImg(
        imgRef, 
        completedCrop, 
        selectedFile?.name || 'cropped-image.jpeg'
      );
      
      // Create a File object from the Blob
      const croppedFile = new File([croppedImage], 
        selectedFile?.name || 'cropped-image.jpeg', 
        { type: 'image/jpeg' }
      );
      
      setSelectedFile(croppedFile);
      setShowCropper(false);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(croppedImage);
      setImgSrc(previewUrl);
      
    } catch (e) {
      console.error('Error creating cropped image:', e);
      toast.error("Error processing image");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      await doctorSchema.validate(doctor, { abortEarly: false });
  
      const formData = new FormData();
      Object.entries(doctor).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      console.log("file",selectedFile)
      if (selectedFile) {
        formData.append("image", selectedFile); 
      } else {
        throw new Error("Profile image is required");  // Added error for missing file
      }
  
      const response = await doctorService.createDoctor(formData);
  
      toast.success(response.message || "Doctor added successfully!");
  
      // Reset form
      setDoctor({
        name: "",
        email: "",
        speciality: "",
        degree: "",
        experience: "",
        address: "",
        about: "",
        available: "true",
      });
  
      setSelectedFile(null);
      setImgSrc(null);
      setShowCropper(false);
      setErrors({});
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add Doctor</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="name" placeholder="Doctor Name" value={doctor.name} onChange={handleChange}  className="p-2 border rounded w-full mb-3" />
        {errors.name && <p className="text-red-500 text-sm mb-3">{errors.name}</p>}

        <input type="email" name="email" placeholder="Doctor Email" value={doctor.email} onChange={handleChange}  className="p-2 border rounded w-full mb-3" />
        {errors.email && <p className="text-red-500 text-sm mb-3">{errors.email}</p>}

        <select
          name="speciality"
          value={doctor.speciality}
          onChange={handleChange}
          className="p-2 border rounded w-full mb-3"
        >
          <option value="" disabled>Select Speciality</option>
          {specialities.map((spec) => (
            <option key={spec._id} value={spec.name}>
              {spec.name}
            </option>
          ))}
        </select>
          {errors.speciality && <p className="text-red-500 text-sm mb-3">{errors.speciality}</p>}

        <input type="text" name="degree" placeholder="Degree" value={doctor.degree} onChange={handleChange}  className="p-2 border rounded w-full mb-3" />
        {errors.degree && <p className="text-red-500 text-sm mb-3">{errors.degree}</p>}

        <input 
          type="number" 
          name="experience" 
          placeholder="Years of Experience" 
          value={doctor.experience === null ? "" : doctor.experience} // Handle null value
          onChange={handleChange} 
          min={1} 
          className="p-2 border rounded w-full mb-3" 
        />
        {errors.experience && <p className="text-red-500 text-sm mb-3">{errors.experience}</p>}

        <input type="text" name="address" placeholder="Address" value={doctor.address} onChange={handleChange}  className="p-2 border rounded w-full mb-3" />
        {errors.address && <p className="text-red-500 text-sm mb-3">{errors.address}</p>}

        <textarea name="about" placeholder="About Doctor" value={doctor.about} onChange={handleChange}  className="p-2 border rounded w-full mb-3"></textarea>
        {errors.about && <p className="text-red-500 text-sm mb-3">{errors.about}</p>}

        {/* Availability Dropdown */}
        <select name="available" value={doctor.available} onChange={handleChange}  className="p-2 border rounded w-full mb-3">
          <option value="true">Available</option>
          <option value="false">Not Available</option>
        </select>
        {errors.available && <p className="text-red-500 text-sm mb-3">{errors.available}</p>}


        {/* Image upload field */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Doctor Profile Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="p-2 border rounded w-full" />
          
          {/* Image preview */}
          {imgSrc && !showCropper && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img 
                src={imgSrc} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-full border-2 border-gray-300" 
              />
            </div>
          )}
        </div>

        {/* Image cropper modal */}
        {showCropper && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <h3 className="text-lg font-bold mb-4">Crop Profile Image</h3>
              <div className="mb-4">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    src={imgSrc || ''}
                    onLoad={onImageLoad}
                    alt="Crop me"
                    className="max-h-96 max-w-full mx-auto"
                  />
                </ReactCrop>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => {
                    setShowCropper(false);
                    setImgSrc(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={applyCrop}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="bg-blue-600 text-white p-3 rounded w-full" disabled={loading}>
          {loading ? "Adding..." : "Add Doctor"}
        </button>
      </form>
    </div>
  );
};

export default AddDoctor;