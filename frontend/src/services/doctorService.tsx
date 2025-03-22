import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api/doctor";

interface LoginResponse {
  message: string;
  token: string;
  doctor: {
    _id: string;
    name: string;
    email: string;
    status: string; // ✅ Add `status` to align with the backend response
  };
}

interface DoctorFormData {
  name: string;
  email: string;
  speciality: string;
  degree: string;
  experience: string;
  address: string;
  about: string;
  available: string;
  appointmentFee: string;
  image?: File;
}

const createDoctor = async (formData: FormData) => {
  const token = localStorage.getItem("adminToken"); // ✅ Retrieve token from storage

  const response = await axios.post(`${API_BASE_URL}/add`, formData, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ Pass token here
      "Content-Type": "multipart/form-data" // ✅ Important for file uploads
    }
  });

  return response.data;
};
const setPassword = async (token: string, password: string): Promise<string> => {
  console.log("Token Sent to API:", token); 
  const response = await axios.post<{ message: string }>(
      `${API_BASE_URL}/set-password`,
      { token, password }
  );
  return response.data.message;
};

   const forgotPassword = async (email: string): Promise<string> => {
    const response = await axios.post<{ message: string }>(
      `${API_BASE_URL}/forgot-password`,
      { email }
    );
    return response.data.message;
  }

  const resetPassword = async (token: string, newPassword: string): Promise<string> => {
    const response = await axios.post<{ message: string }>(
      `${API_BASE_URL}/resetPassword`,
      { token, newPassword }
    );
    return response.data.message;
  }

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/login`,
      { email, password },
      { withCredentials: true }
    );
  
    return response.data;
  };
  
  const uploadImage = async (doctorId: string, imageFile: File) => {
    const imageFormData = new FormData();
    imageFormData.append("image", imageFile);

    const response = await axios.put(
      `${API_BASE_URL}/${doctorId}`,
      imageFormData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("doctortoken")}`,
        }
      }
    );
    return response.data;
  }


  // Update Doctor Profile
  const updateProfile = async (doctorId: string, profileData: object) => {
    const response = await axios.put(
      `${API_BASE_URL}/${doctorId}`,
      profileData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("doctortoken")}`,
        },
      }
    );
    return response.data;
  }

  const signupDoctor = async (doctorData: { name: string; email: string; password: string }) => {
    const response = await axios.post<{ message: string; doctorId: string }>(
      `${API_BASE_URL}/signup`,
      doctorData, // Now sending as JSON, not FormData
      {
        headers: { "Content-Type": "application/json" }, // Updated header for JSON data
      }
    );
    return response.data;
  };
  
    const getDoctorById = async (id: string) => {
      // Use user token if available, otherwise use doctor token
      const userToken = localStorage.getItem("accessToken");
      const doctorToken = localStorage.getItem("doctortoken");
      const token = userToken || doctorToken;
  
      if (!token) throw new Error("Authentication token not found");
  
      const response = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.doctor;
    }

    const approveDoctor = async (doctorId: string, status: string) => {
      const token = localStorage.getItem("adminToken");
    
      return await axios.post(
        `${API_BASE_URL}/approval`, 
        { doctorId, status }, // ✅ Data should be here
        {
          headers: { Authorization: `Bearer ${token}` } // ✅ Headers should be separate
        }
      );
    }
    
    const fetchDoctor = async () => {
      const token = localStorage.getItem("doctortoken");
      const doctorId = localStorage.getItem("doctorId");  // ✅ Correctly fetching doctorId
    
      if (!token) throw new Error("Authentication token not found");
      if (!doctorId) throw new Error("Doctor ID not found");
    
      const response = await axios.get(`${API_BASE_URL}/profile?doctorId=${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    
      return response.data;
    };

    const fetchAllDoctors = async () => {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data; 
    };

        
export const doctorService = { createDoctor ,setPassword,forgotPassword,fetchAllDoctors,
  resetPassword,login,uploadImage,fetchDoctor,updateProfile,signupDoctor,getDoctorById,approveDoctor};
