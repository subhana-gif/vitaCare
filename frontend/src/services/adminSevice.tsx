import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL +"/admin";

export const adminService = {
  login: async (email: string, password: string): Promise<{ token: string }> => {
    const response = await axios.post<{ token: string }>(`${API_BASE_URL}/login`, {
      email,
      password,
    });
    return response.data;
  },

  checkSpecialityStatus: async (specialityName: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/specialities/status`, {
        params: { name: specialityName },
      });
  
      return response.data;
    } catch (error) {
      console.error(`Error in checkSpecialityStatus for "${specialityName}":`, error);
      return { isActive: false }; // Default to false if there's an error
    }
  },

  fetchSpecialities: async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/specialities`);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        throw new Error("Failed to fetch specialities.");
    }
},

addSpeciality: async (name: string, token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/specialities`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || "Failed to add speciality.";
    throw new Error(errorMsg);
  }
},

toggleSpecialityStatus: async (id: string, token: string) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/specialities/${id}/toggle`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to toggle speciality status.";
    throw new Error(message);
  }
},
    
};




