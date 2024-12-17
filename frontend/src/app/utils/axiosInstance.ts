// utils/axiosInstance.ts
import axios from 'axios';
import { cookies } from 'next/headers';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL , // Use environment variable for base URL
  withCredentials: true, // Include cookies if needed
  headers: {
    'Content-Type': 'application/json',
  },
});
// Interceptor to attach token to each request
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from cookies (server-side)
    const cookieStore = cookies();
    const token = (await cookieStore).get("CookieFromServer");

    if (token) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  async(config) => {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

