import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface MonthlyProfitItem {
    year: number;
    month: number;
    totalImportCost: number;
    totalExportRevenue: number;
    profitAmount: number;
    profitPercentage: number;
}

interface ApiArrayResponse<T> {
    success: boolean;
    data: T[];
}

interface ProfitSummaryProps {
    onDataChange?: (data: {
        totalProfit: number;
        totalExportRevenue: number;
        totalImportCost: number;
        year: number;
    }) => void;
}

export function ProfitSummary({ onDataChange }: ProfitSummaryProps) {
    const [profitData, setProfitData] = useState<MonthlyProfitItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("2025");

    const years = ["2023", "2024", "2025"];

    const fetchProfitData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://minhlong.mlhr.org/api/WarehouseExport/dashboard/profit?year=${selectedYear}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch profit data: ${response.statusText}`);
            }

            const json: ApiArrayResponse<MonthlyProfitItem> = await response.json();

            if (!json.success) {
                throw new Error("Profit API returned unsuccessful response");
            }

            setProfitData(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            console.error("Error fetching profit data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfitData();
    }, [selectedYear]);

    useEffect(() => {
        if (profitData.length > 0 && onDataChange) {
            const data = {
                totalProfit: profitData.reduce((sum, item) => sum + item.profitAmount, 0),
                totalExportRevenue: profitData.reduce((sum, item) => sum + item.totalExportRevenue, 0),
                totalImportCost: profitData.reduce((sum, item) => sum + item.totalImportCost, 0),
                year: profitData[0].year
            };
            onDataChange(data);
        }
    }, [profitData]);

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

    const getMonthName = (month: number) => {
        return new Date(2024, month - 1, 1).toLocaleString("vi-VN", { month: "long" });
    };

    const chartData = profitData.map((item) => ({
        month: getMonthName(item.month),
        importCost: item.totalImportCost,
        exportRevenue: item.totalExportRevenue,
        profit: item.profitAmount,
        profitPercentage: item.profitPercentage,
    }));

    const totalProfit = profitData.reduce((sum, item) => sum + item.profitAmount, 0);
    const totalImportCost = profitData.reduce((sum, item) => sum + item.totalImportCost, 0);
    const totalExportRevenue = profitData.reduce((sum, item) => sum + item.totalExportRevenue, 0);

    if (isLoading) {
        return (
            <>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Phân tích lợi nhuận</h3>
                    <Skeleton className="h-9 w-[120px]" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-4">
                        <div className="flex justify-between py-4 px-4 rounded-xl border-2 bg-muted">
                            <div className="w-80 flex items-center">
                                <Skeleton className="h-6 w-[200px]" />
                            </div>
                            <div>
                                <Skeleton className="h-8 w-[200px] mb-2" />
                                <Skeleton className="h-4 w-[300px]" />
                            </div>
                        </div>
                    </div>

                    <Card className="col-span-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-[250px]" />
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Skeleton className="h-[400px] w-full" />
                        </CardContent>
                    </Card>

                    <Card className="col-span-4">
                        <CardHeader>
                            <Skeleton className="h-6 w-[250px]" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Phân tích lợi nhuận</h3>
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
            <div className="grid grid-cols-4 gap-2">
                <div className="col-span-4">
                    <div className={`flex justify-between py-4 px-4 rounded-xl border-2 ${totalProfit >= 0 ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'}`}>
                        <div className={`w-80 flex items-center`}>
                            <div className="text-xl font-medium">
                                Tổng Lợi Nhuận Năm {profitData[0]?.year}
                            </div>
                            {totalProfit >= 0 ? (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                        </div>
                        <div>
                            <div className={`text-2xl font-bold text-right ${getValueColor(totalProfit)}`}>
                                {formatCurrency(totalProfit)}
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                                Doanh thu: <span className={getValueColor(totalExportRevenue)}>{formatCurrency(totalExportRevenue)}</span> • Chi phí:{" "}
                                <span className={getValueColor(-totalImportCost)}>{formatCurrency(totalImportCost)}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Phân Tích Lợi Nhuận Theo Tháng</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(value) =>
                                        `${(value / 1000000).toFixed(1)}M`
                                    }
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === "Lợi nhuận %") {
                                            return formatPercentage(Number(value));
                                        }
                                        return formatCurrency(Number(value));
                                    }}
                                />
                                <Legend />
                                <Bar
                                    yAxisId="left"
                                    dataKey="importCost"
                                    fill="#FF8042"
                                    name="Chi phí nhập"
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="exportRevenue"
                                    fill="#82ca9d"
                                    name="Doanh thu xuất"
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="profit"
                                    fill="#8884d8"
                                    name="Lợi nhuận"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Chi Tiết Lợi Nhuận Theo Tháng</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Tháng</th>
                                    <th className="text-right p-2">Chi phí nhập</th>
                                    <th className="text-right p-2">Doanh thu xuất</th>
                                    <th className="text-right p-2">Lợi nhuận</th>
                                    <th className="text-right p-2">Tỷ lệ lợi nhuận</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((item, idx) => (
                                    <tr
                                        key={`profit-${idx}`}
                                        className="border-b hover:bg-muted/50"
                                    >
                                        <td className="p-2 font-medium">{item.month}</td>
                                        <td className="p-2 text-right font-medium">
                                            {formatCurrency(item.importCost)}
                                        </td>
                                        <td className="p-2 text-right font-medium">
                                            {formatCurrency(item.exportRevenue)}
                                        </td>
                                        <td className="p-2 text-right font-medium">
                                            <span className={getValueColor(item.profit)}>
                                                {formatCurrency(item.profit)}
                                            </span>
                                        </td>
                                        <td className="p-2 text-right font-medium">
                                            <span className={getValueColor(item.profitPercentage)}>
                                                {formatPercentage(item.profitPercentage)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
} 