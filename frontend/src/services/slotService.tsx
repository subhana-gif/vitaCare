import axios from "axios";
import dayjs from "dayjs";

const API_BASE = import.meta.env.VITE_API_BASE_URL +"/slots";

export const slotService = {
  fetchSlots: async (doctorId: string, token: string) => {
    const response = await axios.get(`${API_BASE}/${doctorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data?.slots || [];
  },

  addSlot: async (
doctorId: string, dayOfWeek: string, startTime: string, endTime: string, price: number, token: string  ) => {
    return await axios.post(
      `${API_BASE}/create`,
      { doctorId, dayOfWeek, startTime, endTime, price },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  updateSlot: async (
    slotId: string,
    updatedData: {
      price: number;
      date: string;
      startTime: string;
      endTime: string;
    },
    token: string
  ) => {
    return await axios.put(`${API_BASE}/${slotId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  markUnavailable: async (slotId: string, token: string) => {
    return await axios.put(`${API_BASE}/${slotId}/unavailable`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  fetchSlotsByDate: async (doctorId: string, selectedDate: string, token: string) => {
    try {
      const dayOfWeek = dayjs(selectedDate).format("dddd"); // Convert date to day of week
      const response = await axios.get(`${API_BASE}/${doctorId}/day/${dayOfWeek}`, { // Change endpoint
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data || !Array.isArray(response.data.slots)) {
        throw new Error("Unexpected response structure");
      }
      return response.data.slots;
    } catch (error) {
      console.error("Error fetching slots by date:", error);
      throw error;
    }
  },

  markAvailable: async (slotId: string, token: string) => {
    return await axios.put(`${API_BASE}/${slotId}/available`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
