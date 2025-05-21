import axios from "axios";
import type {
  WarehouseTransfer,
  WarehouseInfo,
  Product,
} from "@/types/warehouse";

const API_URL = "https://minhlong.mlhr.org/api/";

// Create axios instance with authorization header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// Fetch all warehouse transfers
export const fetchWarehouseTransfers = async (): Promise<
  WarehouseTransfer[]
> => {
  try {
    const response = await axios.get(
      `${API_URL}WarehouseTransfer`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching warehouse transfers:", error);
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

// Fetch transfer details with product details
export const fetchTransferDetails = async (
  transferId: number
): Promise<WarehouseTransfer> => {
  try {
    // Fetch transfer details
    const response = await axios.get(
      `${API_URL}WarehouseTransfer/${transferId}`,
      getAuthHeaders()
    );
    const transferWithProductDetails = { ...response.data };

    // Fetch product details in parallel
    const productDetailsPromises = transferWithProductDetails.products.map(
      async (product: Product) => {
        try {
          const productResponse = await axios.get(
            `${API_URL}product/${product.productId}`,
            getAuthHeaders()
          );
          return {
            ...product,
            productDetails: productResponse.data,
          };
        } catch (error) {
          console.error(
            `Error fetching product ${product.productId} details:`,
            error
          );
          return product;
        }
      }
    );

    const productsWithDetails = await Promise.all(productDetailsPromises);
    transferWithProductDetails.products = productsWithDetails;

    return transferWithProductDetails;
  } catch (error) {
    console.error("Error fetching transfer details:", error);
    throw error;
  }
};

// Submit warehouse planning
export const submitWarehousePlanning = async (
  transferId: number,
  warehouseId: number
): Promise<void> => {
  try {
    await axios.put(
      `${API_URL}WarehouseTransfer/plan/${transferId}/${warehouseId}`,
      {}, // Empty body
      getAuthHeaders()
    );
  } catch (error) {
    console.error("Error submitting warehouse planning:", error);
    throw error;
  }
};
