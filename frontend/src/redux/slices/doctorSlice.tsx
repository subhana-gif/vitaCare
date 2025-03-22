import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  doctorId: string | null;
  status: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem("doctortoken") || null,
  doctorId: localStorage.getItem("doctorId") || null,
  status: localStorage.getItem("doctorStatus") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ token: string; doctorId: string; status: string }>
    ) => {
      state.token = action.payload.token;
      state.doctorId = action.payload.doctorId;
      state.status = action.payload.status;

      // Persist data in localStorage
      localStorage.setItem("doctortoken", action.payload.token);
      localStorage.setItem("doctorId", action.payload.doctorId);
      localStorage.setItem("doctorStatus", action.payload.status);
    },
    updateDoctorStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload; 
    },
    clearAuth: (state) => {
      state.token = null;
      state.doctorId = null;

      // Clear from localStorage
      localStorage.removeItem("doctortoken");
      localStorage.removeItem("doctorId");
      localStorage.removeItem("doctorStatus");
    },
  },
});

export const { setAuth, clearAuth,updateDoctorStatus } = authSlice.actions;
export default authSlice.reducer;
