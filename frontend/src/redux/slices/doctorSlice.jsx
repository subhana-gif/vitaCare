import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchDoctors = createAsyncThunk("doctors/fetchDoctors", async ({ page, search, specialization }) => {
    try {
      const response = await axios.get("/api/doctors", { params: { page, search, specialization } });
      console.log("API Response:", response.data); // ✅ Log response
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      throw error;
    }
  });
  
const doctorSlice = createSlice({
    name: "doctors",
    initialState: {
      doctors: [], // ✅ Ensure doctors is always an array
      loading: false,
      error: null,
      totalPages: 1,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchDoctors.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchDoctors.fulfilled, (state, action) => {
          state.loading = false;
          state.doctors = action.payload.doctors || []; // ✅ Handle case where API response is empty
          state.totalPages = action.payload.totalPages || 1;
        })
        .addCase(fetchDoctors.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        });
    },
  });
  
export default doctorSlice.reducer;