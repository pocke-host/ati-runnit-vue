// src/lib/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8080/api",
  withCredentials: false, // flip to true if you later use cookies/sessions
});

// Account endpoints
export const apiRegister = (data) => API.post("/auth/register", data);
export const apiUsersSignup = (data) => API.post("users/signup", data); // signup users
export const apiLogin = (data) => API.post("/auth/login", data);
export const apiMe = () => API.get("/auth/me");
export const apiHealth = () => API.get("/health");
