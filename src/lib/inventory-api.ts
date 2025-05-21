import { Product, WarehouseInventory } from "@/types/inventory";
import axios from "axios";

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

// Fetch product warehouse inventory
export const fetchProductWarehouseInventory = async (
  productId: number
): Promise<WarehouseInventory[]> => {
  try {
    const response = await axios.get(
      `${API_URL}product/${productId}/warehouses-summary`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory for product ${productId}:`, error);
    throw error;
  }
};
