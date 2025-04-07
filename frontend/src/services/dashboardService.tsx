import axios from "axios";

const API_URL = "http://localhost:5001/api/dashboard";

export const dashboardService = {
  getSummaryStats: async (token: string, range: string) => {
    const res = await axios.get(`${API_URL}/summary?range=${range}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },

  getAppointmentStatus: async (token: string, range: string) => {
    const res = await axios.get(`${API_URL}/appointment-status?range=${range}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },

  getPaymentStatus: async (token: string, range: string) => {
    const res = await axios.get(`${API_URL}/payment-status?range=${range}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },

  getTimeSeries: async (token: string, range: string) => {
    const res = await axios.get(`${API_URL}/time-series?range=${range}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },

  getTopDoctors: async (token: string, range: string, limit = 5) => {
    const res = await axios.get(`${API_URL}/top-doctors?range=${range}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },

  getTopPatients: async (token: string, range: string, limit = 5) => {
    const res = await axios.get(`${API_URL}/top-patients?range=${range}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },

  fetchTodayAppointments: async (doctorId: string, token: string) => {
    const res = await axios.get(`${API_URL}/${doctorId}/appointments/today`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  
  fetchAppointmentSummary: async (doctorId: string, token: string, dateRange: string) => {
    const res = await axios.get(`${API_URL}/${doctorId}/appointments/summary?range=${dateRange}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  
  fetchPaymentSummary: async (doctorId: string, token: string, dateRange: string) => {
    const res = await axios.get(`${API_URL}/${doctorId}/payments/summary?range=${dateRange}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  
  fetchPopularTimeSlots: async (doctorId: string, token: string, dateRange: string) => {
    const res = await axios.get(`${API_URL}/${doctorId}/appointments/time-slots?range=${dateRange}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  
  fetchMonthlyStats: async (doctorId: string, token: string) => {
    const res = await axios.get(`${API_URL}/${doctorId}/monthly-stats?months=6`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};
