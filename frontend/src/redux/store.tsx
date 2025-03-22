import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import doctorReducer from "./slices/doctorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorReducer,
  },
});

// ✅ Define RootState and AppDispatch types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
