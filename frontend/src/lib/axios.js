import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "==== BACKEND CRASHED ====\nRoute: " + error.config?.url +
      "\nStatus: " + error.response?.status +
      "\nError Message from Server: ",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// Attach Clerk JWT for cross-domain requests (Vercel frontend → Render backend)
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("Could not get Clerk token:", err.message);
  }
  return config;
});

export default axiosInstance;
