import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import warehouseProfitService from "@/services/warehouse-profit-service";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ProfitData {
    year: number;
    month: number;
    totalImportCost: number;
    totalExportRevenue: number;
    profitAmount: number;
    profitPercentage: number;
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
                <div className="space-y-6">
                    {/* Tổng quan */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm font-medium text-black">Tổng chi phí nhập</div>
                            <div className={`text-2xl font-bold ${totalImportCost === 0 ? 'text-black' :
                                totalImportCost > 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {formatCurrency(totalImportCost)}
                            </div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm font-medium text-black">Tổng doanh thu xuất</div>
                            <div className={`text-2xl font-bold ${totalExportRevenue === 0 ? 'text-black' :
                                totalExportRevenue > 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {formatCurrency(totalExportRevenue)}
                            </div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm font-medium text-black">Tổng lợi nhuận</div>
                            <div className={`text-2xl font-bold ${totalProfit === 0 ? 'text-black' :
                                totalProfit > 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {formatCurrency(totalProfit)}
                            </div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm font-medium text-black">Tỷ lệ lợi nhuận trung bình</div>
                            <div className={`text-2xl font-bold ${averageProfitPercentage === 0 ? 'text-black' :
                                averageProfitPercentage > 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {formatPercentage(averageProfitPercentage)}
                            </div>
                        </div>
                    </div>

                    {/* Bảng chi tiết theo tháng */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-black">Tháng</TableHead>
                                <TableHead className="text-right text-black">Chi phí nhập</TableHead>
                                <TableHead className="text-right text-black">Doanh thu xuất</TableHead>
                                <TableHead className="text-right text-black">Lợi nhuận</TableHead>
                                <TableHead className="text-right text-black">Tỷ lệ lợi nhuận</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.month}>
                                    <TableCell className="text-black">Tháng {item.month}</TableCell>
                                    <TableCell className={`text-right ${item.totalImportCost === 0 ? 'text-black' :
                                        item.totalImportCost > 0 ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {formatCurrency(item.totalImportCost)}
                                    </TableCell>
                                    <TableCell className={`text-right ${item.totalExportRevenue === 0 ? 'text-black' :
                                        item.totalExportRevenue > 0 ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {formatCurrency(item.totalExportRevenue)}
                                    </TableCell>
                                    <TableCell className={`text-right ${item.profitAmount === 0 ? 'text-black' :
                                        item.profitAmount > 0 ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {formatCurrency(item.profitAmount)}
                                    </TableCell>
                                    <TableCell className={`text-right ${item.profitPercentage === 0 ? 'text-black' :
                                        item.profitPercentage > 0 ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {formatPercentage(item.profitPercentage)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
} 