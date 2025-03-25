import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api/admin";

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
    
};




