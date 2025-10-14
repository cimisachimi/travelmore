// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.travelmore.travel/api", // ✅ All requests should go to the /api routes
  // ❌ We don't need withCredentials for token-based auth
  // withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Get the token from local storage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ❌ We no longer need this CSRF cookie helper
// export const getCsrfCookie = async () => {
//   await api.get("/sanctum/csrf-cookie");
// };

export default api;