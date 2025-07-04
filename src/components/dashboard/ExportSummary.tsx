import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageMinus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

interface DailyExportSummaryItem {
    date: string;
    month: number;
    year: number;
    totalExports: number;
    totalQuantity: number;
    totalAmount: number;
}

interface WarehouseExportSummary {
    dailySummaries: DailyExportSummaryItem[];
    totalExports: number;
    totalQuantity: number;
    totalAmount: number;
}

interface ApiObjectResponse<T> {
    success: boolean;
    data: T;
}

interface ExportSummaryData {
    totalAmount: number;
    totalExports: number;
    totalQuantity: number;
}

interface ExportSummaryProps {
    onDataChange?: (data: ExportSummaryData) => void;
}

export function ExportSummary({ onDataChange }: ExportSummaryProps) {
    const [exportSummary, setExportSummary] = useState<WarehouseExportSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return firstDay.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState<string>(() => {
        const now = new Date();
        return now.toISOString().split("T")[0];
    });

    const today = new Date().toISOString().split("T")[0];

    const fetchExportSummary = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://minhlong.mlhr.org/api/WarehouseExport/dashboard/export-summary?fromDate=${startDate}&toDate=${endDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch export summary: ${response.statusText}`);
            }

            const json: ApiObjectResponse<WarehouseExportSummary> = await response.json();

            if (!json.success) {
                throw new Error("Export summary API returned unsuccessful response");
            }

            setExportSummary(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            console.error("Error fetching export summary:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchExportSummary();
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (exportSummary && onDataChange) {
            const data = {
                totalAmount: exportSummary.totalAmount,
                totalExports: exportSummary.totalExports,
                totalQuantity: exportSummary.totalQuantity
            };
            onDataChange(data);
        }
    }, [exportSummary]);

    const handleDateChange = () => {
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();

        // Reset time part for accurate comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (start > end) {
            setError("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
            return;
        }

        if (end > today) {
            setError("Không thể chọn ngày trong tương lai");
            return;
        }

        setError(null);
        fetchExportSummary();
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        const end = new Date(endDate);
        const start = new Date(newStartDate);

        // Reset time part for accurate comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (start > end) {
            setError("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
            return;
        }

        setStartDate(newStartDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        const start = new Date(startDate);
        const end = new Date(newEndDate);
        const today = new Date();

        // Reset time part for accurate comparison
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (start > end) {
            setError("Ngày kết thúc phải lớn hơn ngày bắt đầu");
            return;
        }

        if (end > today) {
            setError("Không thể chọn ngày trong tương lai");
            return;
        }

        setEndDate(newEndDate);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatCurrency = (value: number | undefined | null) => {
        if (value === undefined || value === null) return "N/A";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const formatNumber = (value: number | undefined | null) => {
        if (value === undefined || value === null) return "N/A";
        return value.toLocaleString("vi-VN");
    };

    const dailyExportChartData = exportSummary?.dailySummaries
        .map((item) => ({
            date: formatDate(item.date),
            exports: item.totalExports,
            quantity: item.totalQuantity,
            amount: item.totalAmount,
        }))
        .sort(
            (a, b) =>
                new Date(a.date.split("/").reverse().join("-")).getTime() -
                new Date(b.date.split("/").reverse().join("-")).getTime()
        ) || [];

    const sortedTableData = [...dailyExportChartData].sort(
        (a, b) =>
            new Date(b.date.split("/").reverse().join("-")).getTime() -
            new Date(a.date.split("/").reverse().join("-")).getTime()
    );

    if (isLoading) {
        return (
            <>
                <div className="flex justify-between">
                    <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-4">Hoạt Động Kho (Xuất kho)</h3>
                    <div className="flex justify-end items-center gap-2 mb-4">
                        <Skeleton className="h-9 w-[130px]" />
                        <span>đến</span>
                        <Skeleton className="h-9 w-[130px]" />
                        <Skeleton className="h-9 w-[60px]" />
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <Card className="col-span-4">
                        <div className="flex justify-between">
                            <CardHeader className="w-80 flex items-center">
                                <Skeleton className="h-6 w-[120px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[200px] mb-2" />
                                <Skeleton className="h-4 w-[180px]" />
                            </CardContent>
                        </div>
                    </Card>

                    <Card className="col-span-2">
                        <CardHeader>
                            <Skeleton className="h-6 w-[200px]" />
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>

                    <Card className="col-span-2">
                        <CardHeader>
                            <Skeleton className="h-6 w-[200px]" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
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
        <>  <div className="flex justify-between">
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-4">Hoạt Động Kho (Xuất kho)</h3>
            <div className="flex justify-end items-center gap-2 mb-4">
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    max={endDate}
                    className="border rounded px-2 py-1"
                />
                <span>đến</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    max={today}
                    min={startDate}
                    className="border rounded px-2 py-1"
                />
                <button
                    onClick={handleDateChange}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1 rounded"
                >
                    Xem
                </button>
            </div>
        </div>
            {error && (
                <div className="text-sm text-destructive mb-4">{error}</div>
            )}
            <div className="grid grid-cols-4 gap-2" >
                <Card className="col-span-4">
                    <div className="flex justify-between">
                        <CardHeader className="w-80 flex items-center">
                            <CardTitle className="text-xl font-medium">
                                Tổng Xuất Kho
                            </CardTitle>
                            <PackageMinus className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(exportSummary?.totalAmount)}
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                                {formatNumber(exportSummary?.totalExports)} phiếu •{" "}
                                {formatNumber(exportSummary?.totalQuantity)} Sản phẩm
                            </p>
                        </CardContent>
                    </div>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Xu hướng xuất kho hàng ngày</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyExportChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(value) => formatNumber(value)}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickFormatter={(value) =>
                                        `${(value / 1000000).toFixed(1)}M`
                                    }
                                />
                                <Tooltip
                                    formatter={(value, name) =>
                                        name === "Giá trị"
                                            ? formatCurrency(Number(value))
                                            : formatNumber(Number(value))
                                    }
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="quantity"
                                    stroke="#8884d8"
                                    name="Số lượng xuất"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#82ca9d"
                                    name="Giá trị xuất"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Thống Kê Xuất Kho Hàng Ngày</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Ngày</th>
                                    <th className="text-right p-2">SL Phiếu</th>
                                    <th className="text-right p-2">SL Sản Phẩm</th>
                                    <th className="text-right p-2">Tổng Giá Trị</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTableData.map((item, idx) => (
                                    <tr
                                        key={`export-${idx}`}
                                        className="border-b hover:bg-muted/50"
                                    >
                                        <td className="p-2 font-medium">{item.date}</td>
                                        <td className="p-2 text-right">
                                            {formatNumber(item.exports)}
                                        </td>
                                        <td className="p-2 text-right">
                                            {formatNumber(item.quantity)}
                                        </td>
                                        <td className="p-2 text-right">
                                            {formatCurrency(item.amount)}
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