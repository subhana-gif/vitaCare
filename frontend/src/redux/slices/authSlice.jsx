import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: localStorage.getItem("accessToken") || null, // Persist token
  user: JSON.parse(localStorage.getItem("user")) || null, // Persist user data
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem("accessToken", action.payload); // Save token
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload)); // Save user info
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
    checkBlocked: (state) => {
      if (state.user?.isBlocked) {
        state.accessToken = null;
        state.user = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    },
  },
});

export const { setAccessToken, setUser, logout, checkBlocked } = authSlice.actions;
export default authSlice.reducer;
