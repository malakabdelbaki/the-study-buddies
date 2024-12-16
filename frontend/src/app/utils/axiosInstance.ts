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

axiosInstance.interceptors.request.use(
  async(config) => {
    const cookieStore = await cookies();
    const token = cookieStore.get('CookieFromServer');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('axiosInstance config:',
      config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

