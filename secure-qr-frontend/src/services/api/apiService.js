import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Automatically attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetch user info after login
export async function fetchUserInfo() {
  const response = await API.get("/auth/me");
  return response;
}
