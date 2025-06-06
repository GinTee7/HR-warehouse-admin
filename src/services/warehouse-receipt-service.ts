import axios from 'axios';

interface DailySummary {
    date: string;
    month: number;
    year: number;
    totalReceipts: number;
    totalQuantity: number;
    totalPrice: number;
}

interface WarehouseReceiptData {
    dailySummaries: DailySummary[];
    totalReceipts: number;
    totalQuantity: number;
    totalPrice: number;
}

interface WarehouseReceiptResponse {
    success: boolean;
    data: WarehouseReceiptData;
}



const warehouseReceiptService = {
    getDashboardData: async (startDate?: string, endDate?: string): Promise<WarehouseReceiptData> => {
        try {
            const token = localStorage.getItem("token");
            let url = "https://minhlong.mlhr.org/api/warehouse-receipts/dashboard/warehouse-receipts";

            // Thêm query params nếu có ngày
            if (startDate && endDate) {
                url += `?startDate=${startDate}&endDate=${endDate}`;
            }

            const response = await axios.get<WarehouseReceiptResponse>(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error) {
            console.error("Error fetching warehouse receipt data:", error);
            throw error;
        }
    },
};

export default warehouseReceiptService; 