import axios from "axios";
import type { Warehouse } from "../types/warehouse-type";
import vietnamLocationService from "./vietnam-location-service";

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
    // Lấy token từ session storage thay vì localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const warehouseService = {
  // Get warehouse information for the current user
  getWarehouse: async (): Promise<Warehouse | null> => {
    try {
      const response = await api.get("/warehouses");

      // Nếu API trả về dữ liệu với đối tượng address
      if (response.data && response.data.address) {
        // Lấy tên địa chỉ từ các ID trong đối tượng address
        try {
          // Lấy tên tỉnh/thành phố
          const provinces = await vietnamLocationService.getProvinces();
          const province = provinces.find(
            (p) => p.provinceId === response.data.address.provinceId
          );

          // Lấy tên quận/huyện
          const districts =
            await vietnamLocationService.getDistrictsByProvinceId(
              response.data.address.provinceId
            );
          const district = districts.find(
            (d) => d.districtId === response.data.address.districtId
          );

          // Lấy tên phường/xã
          const wards = await vietnamLocationService.getWardsByDistrictId(
            response.data.address.districtId
          );
          const ward = wards.find(
            (w) => w.wardId === response.data.address.wardId
          );

          // Trả về dữ liệu với cả ID và tên
          return {
            ...response.data,
            street: response.data.address.street,
            province: province?.provinceName || "Không xác định",
            district: district?.districtName || "Không xác định",
            ward: ward?.wardName || "Không xác định",
          };
        } catch (error) {
          console.error("Error fetching location names:", error);
          // Trả về dữ liệu gốc nếu không lấy được tên
          return response.data;
        }
      }

      return response.data;
    } catch (error) {
      // If 404 (not found), return null instead of throwing error
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error("Error fetching warehouse:", error);
      throw error;
    }
  },

  // Cập nhật phương thức createWarehouse để gửi cả ID và tên
  createWarehouse: async (warehouseData: Warehouse): Promise<Warehouse> => {
    try {
      // Đảm bảo dữ liệu gửi đi chứa cả ID và tên địa chỉ đầy đủ
      const response = await api.post("/warehouses", warehouseData);
      return response.data;
    } catch (error) {
      console.error("Error creating warehouse:", error);
      throw error;
    }
  },

  // Cập nhật phương thức updateWarehouse để gửi cả ID và tên
  updateWarehouse: async (warehouseData: Warehouse): Promise<Warehouse> => {
    try {
      // Đảm bảo dữ liệu gửi đi chứa cả ID và tên địa chỉ đầy đủ
      const response = await api.put(
        `/warehouses/${warehouseData.id}`,
        warehouseData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating warehouse:", error);
      throw error;
    }
  },
};

export default warehouseService;
