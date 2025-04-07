import axios, {  InternalAxiosRequestConfig } from "axios";
import { store } from "../redux/store";

const API = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true, // Send cookies
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const state = store.getState();
  const token = state.auth.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const state = store.getState();
  const token = state.auth.accessToken;


  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
