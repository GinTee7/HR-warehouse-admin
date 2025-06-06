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
    PieChart,
    Pie,
    Cell,
    Tooltip,
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

interface SummaryData {
    name: string;
    value: number;
    color: string;
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

export function WarehouseProfitSummary() {
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
            <Card>
                <CardHeader>
                    <CardTitle>Tổng quan lợi nhuận</CardTitle>
                    <CardDescription>Đang tải dữ liệu...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Tính tổng các chỉ số
    const totalImportCost = data.reduce((sum, item) => sum + item.totalImportCost, 0);
    const totalExportRevenue = data.reduce((sum, item) => sum + item.totalExportRevenue, 0);
    const totalProfit = data.reduce((sum, item) => sum + item.profitAmount, 0);
    const averageProfitPercentage = data.reduce((sum, item) => sum + item.profitPercentage, 0) / data.length;

    const summaryData: SummaryData[] = [
        {
            name: "Chi phí nhập",
            value: totalImportCost,
            color: "#ef4444",
        },
        {
            name: "Doanh thu xuất",
            value: totalExportRevenue,
            color: "#22c55e",
        },
        {
            name: "Lợi nhuận",
            value: totalProfit,
            color: "#3b82f6",
        },
        {
            name: "Tỷ lệ lợi nhuận",
            value: averageProfitPercentage,
            color: "#f59e0b",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Tổng quan lợi nhuận</CardTitle>
                        <CardDescription>
                            Thống kê tổng chi phí, doanh thu và lợi nhuận
                        </CardDescription>
                    </div>
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
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={summaryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {summaryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number, name: string) => {
                                    if (name === "Tỷ lệ lợi nhuận") {
                                        return formatPercentage(value);
                                    }
                                    return formatCurrency(value);
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {summaryData.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <span className="text-sm font-medium">
                                {item.name === "Tỷ lệ lợi nhuận"
                                    ? formatPercentage(item.value)
                                    : formatCurrency(item.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 