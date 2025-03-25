import axios from "axios";
import API from "../api/axiosInstance";
import {store} from "../redux/store"; // Import your Redux store

const getToken = () => store.getState().auth.accessToken;
const BASE_URL = "http://localhost:5001/api/user";
const token = localStorage.getItem("adminToken");

export const userService = {

  fetchUsers: async () => {
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("response:",response)
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await API.post("/api/user/forgot-password", { email });
    console.log("API Response:", response); // Check structure
    return response.data; // ✅ Return `response.data`, not `{ data }`
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed.");
    }

    return await response.json();
  },

  getProfile: async (p0: string) => {
    const accessToken = getToken();
    console.log("accesstoken:",accessToken)
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  
    const data = await response.json();
    console.log("Raw Response Data:", data); // ✅ Add this to inspect API response
  
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch profile.");
    }
  
    return data;
  },
  
  updateProfile: async (
p0: string, profileData: {
  name: string;
  phone: string;
  address: string;
  gender: string;
  dob: string;
}  ) => {
    const accessToken = getToken();
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile.");
    }

    return await response.json();
  },

  resetPassword: async (data: { token: string; password: string }) => {
    const response = await axios.post(`${BASE_URL}/reset-password`, data, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
  
    console.log("API Response:", response); // ✅ Add this for clarity
  
    // Ensure correct data handling
    if (response.data && typeof response.data === "object") {
      return response.data; // ✅ Return the correct data object
    } else {
      throw new Error("Unexpected response format");
    }
  },

  sendOTP: async (email: string) => {
    return await axios.post(`${BASE_URL}/send-otp`, { email });
  },

  resendOTP: async (email: string) => {
    return await axios.post(`${BASE_URL}/resend-otp`, { email });
  },

  verifyOTP: async (email: string, otp: string) => {
    return await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
  },

  signup: async (name: string, email: string, password: string) => {
    return await axios.post(`${BASE_URL}/signup`, { name, email, password });
  },

  toggleDoctorBlockStatus: async (userId: string): Promise<void> => {
    try {
      const token = localStorage.getItem("adminToken");
  
      const response = await axios.put(`${BASE_URL}/block/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
  
      if (response.status !== 200) {
        throw new Error("Failed to update user block status");
      }
  
      return response.data;
    } catch (error) {
      console.error("Error toggling user block status:", error);
      throw new Error("Failed to update user status.");
    }
  },

 sendMessage: async (message:string, token:string) => {
    try {
        const response = await fetch("http://localhost:5001/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: message.trim() }),
        });

        if (!response.ok) {
            throw new Error("Failed to send message.");
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message);
    }
}

  };
