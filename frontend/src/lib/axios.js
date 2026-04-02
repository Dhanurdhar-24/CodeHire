import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

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
