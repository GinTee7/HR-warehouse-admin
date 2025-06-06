import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface YearlyProfitData {
    year: number;
    totalImportCost: number;
    totalExportRevenue: number;
    profitAmount: number;
    profitPercentage: number;
}

interface ApiObjectResponse<T> {
    success: boolean;
    data: T;
}

interface YearlyProfitSummaryProps {
    onDataChange?: (data: {
        profitAmount: number;
        profitPercentage: number;
        year: number;
    }) => void;
}

export function YearlyProfitSummary({ onDataChange }: YearlyProfitSummaryProps) {
    const [profitData, setProfitData] = useState<YearlyProfitData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("2025");

    const years = ["2023", "2024", "2025"];

    const fetchProfitData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://minhlong.mlhr.org/api/WarehouseExport/dashboard/profit-year?year=${selectedYear}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch yearly profit data: ${response.statusText}`);
            }

            const json: ApiObjectResponse<YearlyProfitData> = await response.json();

            if (!json.success) {
                throw new Error("Yearly profit API returned unsuccessful response");
            }

            setProfitData(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            console.error("Error fetching yearly profit data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfitData();
    }, [selectedYear]);

    useEffect(() => {
        if (profitData && onDataChange) {
            onDataChange({
                profitAmount: profitData.profitAmount,
                profitPercentage: profitData.profitPercentage,
                year: profitData.year
            });
        }
    }, [profitData, onDataChange]);

    const handleYearChange = (value: string) => {
        setSelectedYear(value);
    };

    const formatCurrency = (value: number | undefined | null) => {
        if (value === undefined || value === null) return "N/A";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const formatPercentage = (value: number | undefined | null) => {
        if (value === undefined || value === null) return "N/A";
        return `${value.toFixed(2)}%`;
    };

    const getValueColor = (value: number) => {
        return value >= 0 ? "text-green-500" : "text-red-500";
    };

    const getChartData = () => {
        if (!profitData) return [];
        return [
            { name: "Doanh Thu", value: profitData.totalExportRevenue },
            { name: "Chi Phí", value: profitData.totalImportCost }
        ];
    };

    const COLORS = ["#22c55e", "#ef4444"];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-sm">Đang tải dữ liệu lợi nhuận năm...</div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Tổng quan lợi nhuận năm</h3>
                <Select value={selectedYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Chọn năm" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year}>
                                Năm {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {error && (
                <div className="text-sm text-destructive mb-4">{error}</div>
            )}
            <div className="grid grid-cols-4 gap-4">
                <div className={`col-span-4 p-4 rounded-xl border-2 ${(profitData?.profitAmount ?? 0) >= 0 ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="text-xl font-medium">
                                Tổng Lợi Nhuận Năm {profitData?.year}
                            </div>
                            {profitData?.profitAmount && profitData.profitAmount >= 0 ? (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                        </div>
                        <div className="text-right">
                            <div className={`text-2xl font-bold ${getValueColor(profitData?.profitAmount || 0)}`}>
                                {formatCurrency(profitData?.profitAmount)}
                            </div>
                            <div className={`text-sm mt-1 ${getValueColor(profitData?.profitPercentage || 0)}`}>
                                {formatPercentage(profitData?.profitPercentage)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 p-6 rounded-xl border bg-blue-50 border-blue-100">
                    <div className="text-sm  mb-2">Tổng Doanh Thu</div>
                    <div className={`text-2xl font-bold ${getValueColor(profitData?.totalExportRevenue || 0)}`}>
                        {formatCurrency(profitData?.totalExportRevenue)}
                    </div>
                </div>

                <div className="col-span-2 p-6 rounded-xl border bg-orange-50 border-orange-100">
                    <div className="text-sm  mb-2">Tổng Chi Phí</div>
                    <div className={`text-2xl font-bold ${getValueColor(-(profitData?.totalImportCost || 0))}`}>
                        {formatCurrency(profitData?.totalImportCost)}
                    </div>
                </div>

                <div className="col-span-4 p-6 rounded-xl border bg-purple-50 border-purple-100">
                    <div className="text-sm text-muted-foreground mb-4">Phân bố Doanh Thu & Chi Phí</div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getChartData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                >
                                    {getChartData().map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
} 