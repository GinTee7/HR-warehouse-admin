import axios from "axios";
import type { PendingAccount } from "../approve-page";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const approveService = {
  // Get all pending accounts
  getPendingAccounts: async (): Promise<PendingAccount[]> => {
    try {
      const response = await api.get("/auth");
      return Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error("Error fetching pending accounts:", error);
      throw error;
    }
  },

  // Approve an account
  approveAccount: async (id: number): Promise<void> => {
    try {
      await api.put(`/auth/register/${id}`);
    } catch (error) {
      console.error("Error approving account:", error);
      throw error;
    }
  },

  // Reject an account
  rejectAccount: async (id: number): Promise<void> => {
    try {
      await api.put(`/${id}/cancel`);
    } catch (error) {
      console.error("Error rejecting account:", error);
      throw error;
    }
  },
};
