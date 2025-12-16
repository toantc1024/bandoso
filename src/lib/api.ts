// api.js
import axios from "axios";
import type { AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/auth.store";

interface ApiInstance extends AxiosInstance { }

let apiInstance: ApiInstance | null = null;

export const getApi = () => {
  if (!apiInstance) {
    apiInstance = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_API_URL,
      timeout: 36000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include access token
    apiInstance.interceptors.request.use(
      async (config) => {
        try {
          const accessToken = await useAuthStore.getState().getAccessToken();
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
          }
        } catch (error) {
          // If unable to get access token, continue without it
          console.warn("Unable to get access token:", error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add interceptors once
    apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  return apiInstance;
};
