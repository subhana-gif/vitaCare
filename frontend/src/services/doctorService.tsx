import axios from "axios";
import {Chat} from "../types/chat"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL +"/doctor";

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
      doctorData,
      {
        headers: { "Content-Type": "application/json" },
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
      
      if (!token) {
        throw new Error("Authentication token not found");
      }
    
      try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        return response.data; // Now returns the profile object directly
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
        throw error;
      }
    };


    const fetchAllDoctors = async () => {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data; 
    };


    const updateDoctorProfile = async (doctorId: string,token: string,formData: FormData): Promise<Response> => {
      try {
        const response = await fetch(`${API_BASE_URL}/${doctorId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`Failed to update doctor. Status: ${response.status}`);
        }
  
        return response;
      } catch (error) {
        throw error;
      }
    }

const fetchDoctorChats = async (doctorId: string, token: string): Promise<Chat[]> => {
  const res = await axios.get(import.meta.env.VITE_API_BASE_URL +`/chat/doctor/${doctorId}/chats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const fetchDoctorRating = async (doctorId: string) => {
  try {
    const response = await axios.get(import.meta.env.VITE_API_BASE_URL +`/reviews/${doctorId}/rating`);
    console.log("response of doctor rating:",response)
    return response.data;
  } catch (error) {
    console.error(`Error fetching rating for doctor ${doctorId}:`, error);
    throw error;
  }
};

        
export const doctorService = { createDoctor ,setPassword,forgotPassword,fetchAllDoctors,
  resetPassword,login,uploadImage,fetchDoctor,updateProfile,signupDoctor,getDoctorById,approveDoctor,
  fetchDoctorChats,updateDoctorProfile,fetchDoctorRating};