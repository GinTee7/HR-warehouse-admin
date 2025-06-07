import axios from "axios";

interface ProfitData {
    year: number;
    month: number;
    totalImportCost: number;
    totalExportRevenue: number;
    profitAmount: number;
    profitPercentage: number;
}

interface ProfitResponse {
    success: boolean;
    data: ProfitData[];
}

const warehouseProfitService = {
    getProfitData: async (year: number): Promise<ProfitData[]> => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get<ProfitResponse>(
                `https://minhlong.mlhr.org/api/WarehouseExport/dashboard/profit-warehouse?year=${year}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching profit data:", error);
            throw error;
        }
    },
};

export default warehouseProfitService; 