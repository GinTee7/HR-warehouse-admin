import axios from "axios";
import type { WarehouseInfo, WarehouseTransfer } from "@/types/warehouse";
import type { Product } from "@/types/inventory";
import { ExportRequest } from "@/types/export";

const API_URL = "https://minhlong.mlhr.org/api/";

// Get token from session storage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// Fetch outgoing transfers (from source warehouse)
export const fetchOutgoingTransfers = async (
  warehouseId: number
): Promise<WarehouseTransfer[]> => {
  try {
    const response = await axios.get(
      `${API_URL}warehouse-transfer/by-destination/${warehouseId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching outgoing transfers:", error);
    throw error;
  }
};

// Fetch incoming transfers (to destination warehouse)
export const fetchIncomingTransfers = async (
  warehouseId: number
): Promise<WarehouseTransfer[]> => {
  try {
    const response = await axios.get(
      `${API_URL}warehouse-transfer/by-source/${warehouseId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching incoming transfers:", error);
    throw error;
  }
};

// Fetch all warehouses
export const fetchWarehouses = async (): Promise<WarehouseInfo[]> => {
  try {
    const response = await axios.get(`${API_URL}warehouse`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }
};

// Fetch all products
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}product`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Fetch export requests for a warehouse
export const fetchExportRequests = async (
  warehouseId: number
): Promise<ExportRequest[]> => {
  try {
    const response = await axios.get(
      `${API_URL}WarehouseRequestExport/warehouse/${warehouseId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching export requests:", error);
    throw error;
  }
};

// Create a new transfer request
export const createTransfer = async (transferData: any): Promise<void> => {
  try {
    await axios.post(
      `${API_URL}WarehouseTransfer`,
      transferData,
      getAuthHeaders()
    );
  } catch (error) {
    console.error("Error creating transfer:", error);
    throw error;
  }
};

// Approve a transfer request
export const approveTransfer = async (transferId: number): Promise<void> => {
  try {
    await axios.post(
      `${API_URL}warehouse-transfer/approve/${transferId}`,
      getAuthHeaders()
    );
  } catch (error) {
    console.error("Error approving transfer:", error);
    throw error;
  }
};
