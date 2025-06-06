import axios from "axios";

interface TopExportedProduct {
    productId: number;
    productCode: string;
    productName: string;
    totalExportedQuantity: number;
}

interface TopExportedProductsResponse {
    success: boolean;
    data: TopExportedProduct[];
}

const warehouseExportService = {
    getTopExportedProducts: async (top: number = 5): Promise<TopExportedProduct[]> => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get<TopExportedProductsResponse>(
                `https://minhlong.mlhr.org/api/WarehouseExport/dashboard/top-exported-products?top=${top}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching top exported products:", error);
            throw error;
        }
    },
};

export default warehouseExportService; 