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
import warehouseReceiptService from "@/services/warehouse-receipt-service";
import { toast } from "sonner";
import { DollarSign, Package, PackageCheck } from "lucide-react";
import { TopExportedProducts } from "./top-exported-products";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { WarehouseProfitChart } from "./warehouse-profit-chart";

interface WarehouseReceiptChartProps {
    className?: string;
}

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

interface DailyDataItem {
    date: string;
    receipts: number;
    quantity: number;
    price: number;
}

export function WarehouseReceiptChart({ className }: WarehouseReceiptChartProps) {
    const [data, setData] = useState<WarehouseReceiptData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const today = format(new Date(), "yyyy-MM-dd");
    const [startDate, setStartDate] = useState<string>("2025-06-01");
    const [endDate, setEndDate] = useState<string>(today);
    const [topCount, setTopCount] = useState<string>("5");

    const handleDateChange = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const formattedStartDate = format(new Date(startDate), "dd-MM-yyyy");
            const formattedEndDate = format(new Date(endDate), "dd-MM-yyyy");
            const response = await warehouseReceiptService.getDashboardData(
                formattedStartDate,
                formattedEndDate
            );
            console.log(`API Response for ${formattedStartDate} to ${formattedEndDate}:`, response);
            setData(response);
        } catch (error) {
            console.error("Error fetching warehouse receipt data:", error);
            setError("Không thể tải dữ liệu thống kê nhập kho");
            toast.error("Không thể tải dữ liệu thống kê nhập kho");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleDateChange();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return value.toLocaleString("vi-VN");
    };

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Thống kê nhập kho</CardTitle>
                    <CardDescription>Đang tải dữ liệu...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Thống kê nhập kho</CardTitle>
                    <CardDescription className="text-red-500">{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Thống kê nhập kho</CardTitle>
                    <CardDescription>Không có dữ liệu</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const dailyData: DailyDataItem[] = data.dailySummaries.length > 0
        ? data.dailySummaries.map((item: DailySummary) => ({
            date: new Date(item.date).toLocaleDateString("vi-VN"),
            receipts: item.totalReceipts,
            quantity: item.totalQuantity,
            price: item.totalPrice,
        }))
        : [{
            date: format(new Date(startDate), "dd/MM/yyyy"),
            receipts: 0,
            quantity: 0,
            price: 0
        }];

    return (
        <div className="space-y-4">
            <div className="flex justify-end items-center gap-2">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={today}
                    className="border rounded px-2 py-1"
                />
                <span>đến</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={today}
                    className="border rounded px-2 py-1"
                />
                <button
                    onClick={handleDateChange}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-1 rounded"
                >
                    Xem
                </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng phiếu nhập</CardTitle>
                        <PackageCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(data.totalReceipts)}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng số phiếu nhập kho
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số lượng sản phẩm</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(data.totalQuantity)}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng số sản phẩm đã nhập
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalPrice)}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng giá trị nhập kho
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Card className={className}>
                    <CardHeader>
                        <CardTitle>Xu hướng nhập kho theo ngày</CardTitle>
                        <CardDescription>
                            Biểu đồ thể hiện số lượng và giá trị nhập kho theo ngày
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip
                                        formatter={(value: number, name: string) => {
                                            if (name === "Giá trị") {
                                                return formatCurrency(value);
                                            }
                                            return formatNumber(value);
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="receipts"
                                        stroke="#8884d8"
                                        name="Số phiếu nhập"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="quantity"
                                        stroke="#82ca9d"
                                        name="Số lượng"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#ffc658"
                                        name="Giá trị"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className={className}>
                    <CardHeader className="flex justify-between">
                        <div>
                            <CardTitle>Sản phẩm xuất nhiều nhất</CardTitle>
                            <CardDescription>
                                Top {topCount} sản phẩm xuất kho nhiều nhất
                            </CardDescription>
                        </div>
                        <div>
                            <Select
                                value={topCount}
                                onValueChange={setTopCount}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Top" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <SelectItem key={num} value={num.toString()}>
                                            Top {num}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <div className="h-[300px] overflow-y-auto mx-2">
                        <TopExportedProducts topCount={topCount} />
                    </div>
                </Card>
            </div>
            <div className="mt-4">
                <WarehouseProfitChart />
            </div>
        </div>
    );
} 