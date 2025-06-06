import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    LineChart,
    Line,
    Legend,
} from "recharts";
import warehouseProfitService from "@/services/warehouse-profit-service";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ProfitData {
    year: number;
    month: number;
    totalImportCost: number;
    totalExportRevenue: number;
    profitAmount: number;
    profitPercentage: number;
}

interface ChartDataItem {
    month: string;
    "Chi phí nhập": number;
    "Doanh thu xuất": number;
    "Lợi nhuận": number;
    "Tỷ lệ lợi nhuận": number;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};

const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
};

export function WarehouseProfitChart() {
    const [data, setData] = useState<ProfitData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

    useEffect(() => {
        const fetchProfitData = async () => {
            try {
                setIsLoading(true);
                const profitData = await warehouseProfitService.getProfitData(parseInt(selectedYear));
                setData(profitData);
            } catch (error) {
                console.error("Error fetching profit data:", error);
                toast.error("Không thể tải dữ liệu lợi nhuận");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfitData();
    }, [selectedYear]);

    if (isLoading) {
        return (
            <Card className="h-[400px]">
                <CardHeader>
                    <CardTitle>Thống kê lợi nhuận</CardTitle>
                    <CardDescription>Đang tải dữ liệu...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const chartData: ChartDataItem[] = data.map((item) => ({
        month: `Tháng ${item.month}`,
        "Chi phí nhập": item.totalImportCost,
        "Doanh thu xuất": item.totalExportRevenue,
        "Lợi nhuận": item.profitAmount,
        "Tỷ lệ lợi nhuận": item.profitPercentage,
    }));

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Thống kê lợi nhuận</CardTitle>
                        <CardDescription>
                            Biểu đồ thể hiện chi phí, doanh thu và lợi nhuận theo tháng
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Năm" />
                            </SelectTrigger>
                            <SelectContent>
                                {[currentYear - 1, currentYear].map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip
                                formatter={(value: number, name: string) => {
                                    if (name === "Tỷ lệ lợi nhuận") {
                                        return formatPercentage(value);
                                    }
                                    return formatCurrency(value);
                                }}
                            />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="Chi phí nhập"
                                stroke="#ef4444"
                                name="Chi phí nhập"
                                strokeWidth={2}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="Doanh thu xuất"
                                stroke="#22c55e"
                                name="Doanh thu xuất"
                                strokeWidth={2}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="Lợi nhuận"
                                stroke="#3b82f6"
                                name="Lợi nhuận"
                                strokeWidth={2}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="Tỷ lệ lợi nhuận"
                                stroke="#f59e0b"
                                name="Tỷ lệ lợi nhuận"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
} 