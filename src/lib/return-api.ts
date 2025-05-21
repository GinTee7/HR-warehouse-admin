import axios from "axios";
import { toast } from "sonner";
import type { ReturnWarehouseReceipt } from "@/types/warehouse";

const API_URL = import.meta.env.VITE_API_URL || "https://api.example.com/";

// Fetch return requests for a warehouse
export async function fetchReturnRequests(): Promise<ReturnWarehouseReceipt[]> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }
    const idWarehouseId = localStorage.getItem("warehouseId");
    const response = await axios.get(
      `${API_URL}returns/warehouse-return/WarehouseReturnByWarehouseId/${idWarehouseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching return requests:", error);
    toast.error("Không thể tải dữ liệu yêu cầu trả hàng");
    return [];
  }
}

// Fetch details for a specific return request
export async function fetchReturnRequestDetails(
  returnRequestId: string
): Promise<ReturnWarehouseReceipt | null> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const response = await axios.get(
      `${API_URL}returns/for-warehouse/${returnRequestId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching return request details:", error);
    toast.error("Không thể tải chi tiết yêu cầu trả hàng");
    return null;
  }
}

// Approve a return request
export async function approveReturnRequest(
  returnRequestId: string
): Promise<boolean> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const response = await axios.post(
      `${API_URL}/api/returns/approve/${returnRequestId}`,
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200 || response.status === 201) {
      toast.success("Đã duyệt yêu cầu trả hàng thành công");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error approving return request:", error);
    toast.error("Không thể duyệt yêu cầu trả hàng");
    return false;
  }
}

// Reject a return request
export async function rejectReturnRequest(
  returnRequestId: string
): Promise<boolean> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const response = await axios.post(
      `${API_URL}/returns/reject/${returnRequestId}`,
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200 || response.status === 201) {
      toast.success("Đã từ chối yêu cầu trả hàng thành công");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error rejecting return request:", error);
    toast.error("Không thể từ chối yêu cầu trả hàng");
    return false;
  }
}
