import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PackageCheck,
  Truck,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ApiResponse<T> {
  success: boolean;
  data: T[];
}

interface ReceiptStats {
  month: number;
  totalReceipts: number;
  totalImportValue: number;
  totalQuantityImported: number;
}

interface ExportStats {
  month: number;
  totalExports: number;
  totalExportValue: number;
  totalQuantityExported: number;
}

interface OrderStats {
  month: number;
  exportedOrderCount: number;
  totalRevenue: number;
  totalProductSold: number;
}

interface ChartData {
  month: string;
  receipts: number;
  exports: number;
  orders: number;
  importValue: number;
  exportValue: number;
  revenue: number;
  quantityImported: number;
  quantityExported: number;
  productsSold: number;
}

export default function WarehouseDashboard() {
  const [receiptStats, setReceiptStats] = useState<ReceiptStats[]>([]);
  const [exportStats, setExportStats] = useState<ExportStats[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [receiptRes, exportRes, orderRes] = await Promise.all([
          fetch(
            "https://minhlong.mlhr.org/api/warehouse-receipts/dashboard/monthly-receipt-stats"
          ),
          fetch(
            "https://minhlong.mlhr.org/api/WarehouseExport/dashboard/monthly-export-stats"
          ),
          fetch(
            "https://minhlong.mlhr.org/api/orders/dashboard/monthly-export-stats"
          ),
        ]);

        if (!receiptRes.ok || !exportRes.ok || !orderRes.ok) {
          throw new Error("Failed to fetch data from one or more APIs");
        }

        const [receiptData, exportData, orderData] = await Promise.all([
          receiptRes.json() as Promise<ApiResponse<ReceiptStats>>,
          exportRes.json() as Promise<ApiResponse<ExportStats>>,
          orderRes.json() as Promise<ApiResponse<OrderStats>>,
        ]);

        if (!receiptData.success || !exportData.success || !orderData.success) {
          throw new Error("API returned unsuccessful response");
        }

        setReceiptStats(receiptData.data);
        setExportStats(exportData.data);
        setOrderStats(orderData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert month number to month name
  const getMonthName = (month: number) => {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return monthNames[month - 1] || `Tháng ${month}`;
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Prepare chart data
  const chartData: ChartData[] = [];
  const allMonths = new Set([
    ...receiptStats.map((item) => item.month),
    ...exportStats.map((item) => item.month),
    ...orderStats.map((item) => item.month),
  ]);

  Array.from(allMonths)
    .sort((a, b) => a - b)
    .forEach((month) => {
      const receipt = receiptStats.find((item) => item.month === month);
      const exportStat = exportStats.find((item) => item.month === month);
      const order = orderStats.find((item) => item.month === month);

      chartData.push({
        month: getMonthName(month),
        receipts: receipt?.totalReceipts || 0,
        exports: exportStat?.totalExports || 0,
        orders: order?.exportedOrderCount || 0,
        importValue: receipt?.totalImportValue || 0,
        exportValue: exportStat?.totalExportValue || 0,
        revenue: order?.totalRevenue || 0,
        quantityImported: receipt?.totalQuantityImported || 0,
        quantityExported: exportStat?.totalQuantityExported || 0,
        productsSold: order?.totalProductSold || 0,
      });
    });

  // Calculate totals
  const totalReceipts = receiptStats.reduce(
    (sum, item) => sum + item.totalReceipts,
    0
  );
  const totalExports = exportStats.reduce(
    (sum, item) => sum + item.totalExports,
    0
  );
  const totalOrders = orderStats.reduce(
    (sum, item) => sum + item.exportedOrderCount,
    0
  );
  const totalImportValue = receiptStats.reduce(
    (sum, item) => sum + item.totalImportValue,
    0
  );
  const totalExportValue = exportStats.reduce(
    (sum, item) => sum + item.totalExportValue,
    0
  );
  const totalRevenue = orderStats.reduce(
    (sum, item) => sum + item.totalRevenue,
    0
  );
  const totalQuantityImported = receiptStats.reduce(
    (sum, item) => sum + item.totalQuantityImported,
    0
  );
  const totalQuantityExported = exportStats.reduce(
    (sum, item) => sum + item.totalQuantityExported,
    0
  );
  const totalProductsSold = orderStats.reduce(
    (sum, item) => sum + item.totalProductSold,
    0
  );

  // Pie chart data for value distribution
  const valueDistributionData = [
    { name: "Doanh thu đơn hàng", value: totalRevenue, color: "#8884d8" },
    { name: "Giá trị xuất kho", value: totalExportValue, color: "#82ca9d" },
    { name: "Giá trị nhập kho", value: totalImportValue, color: "#ffc658" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-red-500">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard Kho Hàng
        </h2>
        <p className="text-muted-foreground">
          Tổng quan chi tiết về hoạt động xuất nhập kho và doanh thu
        </p>
      </div>
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Từ {totalOrders} đơn hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nhập kho</CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReceipts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalImportValue)} •{" "}
              {totalQuantityImported.toLocaleString()} sản phẩm
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng xuất kho</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExports.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalExportValue)} •{" "}
              {totalQuantityExported.toLocaleString()} sản phẩm
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sản phẩm đã bán
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProductsSold.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Từ {totalOrders} đơn hàng xuất
            </p>
          </CardContent>
        </Card>
      </div>
      ư {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Biểu đồ hoạt động theo tháng</CardTitle>
            <CardDescription>
              Thống kê số lượng giao dịch nhập, xuất kho và đơn hàng
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Đơn hàng"
                />
                <Line
                  type="monotone"
                  dataKey="exports"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Xuất kho"
                />
                <Line
                  type="monotone"
                  dataKey="receipts"
                  stroke="#ffc658"
                  strokeWidth={2}
                  name="Nhập kho"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bổ giá trị</CardTitle>
            <CardDescription>Tỷ trọng giá trị các hoạt động</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={valueDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {valueDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Value and Quantity Charts */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ giá trị theo tháng</CardTitle>
            <CardDescription>
              So sánh giá trị nhập kho, xuất kho và doanh thu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
                <Bar dataKey="exportValue" fill="#82ca9d" name="Giá trị xuất" />
                <Bar dataKey="importValue" fill="#ffc658" name="Giá trị nhập" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ số lượng theo tháng</CardTitle>
            <CardDescription>
              So sánh số lượng sản phẩm nhập, xuất và bán
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantityImported" fill="#ffc658" name="SL nhập" />
                <Bar dataKey="quantityExported" fill="#82ca9d" name="SL xuất" />
                <Bar dataKey="productsSold" fill="#8884d8" name="SL bán" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê chi tiết theo tháng</CardTitle>
          <CardDescription>
            Dữ liệu chi tiết về tất cả các hoạt động
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tháng</th>
                  <th className="text-right p-2">Đơn hàng</th>
                  <th className="text-right p-2">Doanh thu</th>
                  <th className="text-right p-2">Xuất kho</th>
                  <th className="text-right p-2">Nhập kho</th>
                  <th className="text-right p-2">SL bán</th>
                  <th className="text-right p-2">SL xuất</th>
                  <th className="text-right p-2">SL nhập</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((data, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{data.month}</td>
                    <td className="p-2 text-right">{data.orders}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(data.revenue)}
                    </td>
                    <td className="p-2 text-right">{data.exports}</td>
                    <td className="p-2 text-right">{data.receipts}</td>
                    <td className="p-2 text-right">
                      {data.productsSold.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {data.quantityExported.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {data.quantityImported.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
