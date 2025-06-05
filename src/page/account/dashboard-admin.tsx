import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Building,
  PackagePlus, // For Imports
  PackageMinus, // For Exports
  DollarSign,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  MailWarning,
  PieChartIcon,
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

//region API Data Interfaces
interface AccountDashboardData {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  totalAgencies: number;
  totalSalesManagers: number;
  totalWarehouseManagers: number;
  totalRegisterAccounts: number;
  approvedRegisterAccounts: number;
  pendingRegisterAccounts: number;
  canceledRegisterAccounts: number;
  unverifiedEmailCount: number;
}

interface DailySummaryBase {
  date: string; // Assuming ISO string like "2025-05-25T00:00:00"
  month: number;
  year: number;
}

interface DailyExportSummaryItem extends DailySummaryBase {
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

interface DailyReceiptSummaryItem extends DailySummaryBase {
  totalReceipts: number;
  totalQuantity: number;
  totalPrice: number;
}

interface WarehouseReceiptSummary {
  dailySummaries: DailyReceiptSummaryItem[];
  totalReceipts: number;
  totalQuantity: number;
  totalPrice: number;
}

interface MonthlyProfitItem {
  year: number;
  month: number;
  totalImportCost: number;
  totalExportRevenue: number;
  profitAmount: number;
  profitPercentage: number;
}

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

interface ApiArrayResponse<T> {
  success: boolean;
  data: T[];
}
//endregion

export default function AdminDashboard() {
  const [accountData, setAccountData] = useState<AccountDashboardData | null>(
    null
  );
  const [exportSummary, setExportSummary] =
    useState<WarehouseExportSummary | null>(null);
  const [receiptSummary, setReceiptSummary] =
    useState<WarehouseReceiptSummary | null>(null);
  const [monthlyProfit, setMonthlyProfit] = useState<MonthlyProfitItem[]>([]);
  const [yearlyProfit, setYearlyProfit] = useState<YearlyProfitData | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    return {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    };
  };
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          accountRes,
          exportSummaryRes,
          receiptSummaryRes,
          monthlyProfitRes,
          yearlyProfitRes,
        ] = await Promise.all([
          fetch("https://minhlong.mlhr.org/api/admin/account-dashboard", {
            headers: getAuthHeaders(),
          }),
          fetch(
            "https://minhlong.mlhr.org/api/WarehouseExport/dashboard/export-summary",
            {
              headers: getAuthHeaders(),
            }
          ),
          fetch(
            "https://minhlong.mlhr.org/api/warehouse-receipts/dashboard/range-summary",
            {
              headers: getAuthHeaders(),
            }
          ),
          fetch(
            "https://minhlong.mlhr.org/api/WarehouseExport/dashboard/profit",
            {
              headers: getAuthHeaders(),
            }
          ),
          fetch(
            "https://minhlong.mlhr.org/api/WarehouseExport/dashboard/profit-year",
            {
              headers: getAuthHeaders(),
            }
          ),
        ]);

        if (!accountRes.ok)
          throw new Error(
            `Failed to fetch account dashboard: ${accountRes.statusText}`
          );
        if (!exportSummaryRes.ok)
          throw new Error(
            `Failed to fetch export summary: ${exportSummaryRes.statusText}`
          );
        if (!receiptSummaryRes.ok)
          throw new Error(
            `Failed to fetch receipt summary: ${receiptSummaryRes.statusText}`
          );
        if (!monthlyProfitRes.ok)
          throw new Error(
            `Failed to fetch monthly profit: ${monthlyProfitRes.statusText}`
          );
        if (!yearlyProfitRes.ok)
          throw new Error(
            `Failed to fetch yearly profit: ${yearlyProfitRes.statusText}`
          );

        const accountJson: AccountDashboardData = await accountRes.json(); // This API returns the object directly
        const exportSummaryJson: ApiObjectResponse<WarehouseExportSummary> =
          await exportSummaryRes.json();
        const receiptSummaryJson: ApiObjectResponse<WarehouseReceiptSummary> =
          await receiptSummaryRes.json();
        const monthlyProfitJson: ApiArrayResponse<MonthlyProfitItem> =
          await monthlyProfitRes.json();
        const yearlyProfitJson: ApiObjectResponse<YearlyProfitData> =
          await yearlyProfitRes.json();

        // Assuming the account API response is the direct data object, not nested under "data"
        setAccountData(accountJson);

        if (!exportSummaryJson.success)
          throw new Error("Export summary API returned unsuccessful response");
        setExportSummary(exportSummaryJson.data);

        if (!receiptSummaryJson.success)
          throw new Error("Receipt summary API returned unsuccessful response");
        setReceiptSummary(receiptSummaryJson.data);

        if (!monthlyProfitJson.success)
          throw new Error("Monthly profit API returned unsuccessful response");
        setMonthlyProfit(monthlyProfitJson.data);

        if (!yearlyProfitJson.success)
          throw new Error("Yearly profit API returned unsuccessful response");
        setYearlyProfit(yearlyProfitJson.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMonthName = (month: number, year?: number) => {
    const date = new Date(year || new Date().getFullYear(), month - 1, 1);
    return date.toLocaleString("vi-VN", {
      month: "long",
      year: year ? "numeric" : undefined,
    });
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

  // Prepare chart data
  const dailyExportChartData =
    exportSummary?.dailySummaries
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

  const dailyReceiptChartData =
    receiptSummary?.dailySummaries
      .map((item) => ({
        date: formatDate(item.date),
        receipts: item.totalReceipts,
        quantity: item.totalQuantity,
        price: item.totalPrice,
      }))
      .sort(
        (a, b) =>
          new Date(a.date.split("/").reverse().join("-")).getTime() -
          new Date(b.date.split("/").reverse().join("-")).getTime()
      ) || [];

  const monthlyProfitChartData = monthlyProfit
    .map((item) => ({
      month: getMonthName(item.month, item.year),
      importCost: item.totalImportCost,
      exportRevenue: item.totalExportRevenue,
      profit: item.profitAmount,
      profitPercentage: item.profitPercentage,
    }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.month
        .toLowerCase()
        .replace("tháng ", "")
        .split(" năm ");
      const [bMonth, bYear] = b.month
        .toLowerCase()
        .replace("tháng ", "")
        .split(" năm ");
      const dateA = new Date(
        parseInt(aYear || `${new Date().getFullYear()}`),
        parseInt(aMonth) - 1
      );
      const dateB = new Date(
        parseInt(bYear || `${new Date().getFullYear()}`),
        parseInt(bMonth) - 1
      );
      return dateA.getTime() - dateB.getTime();
    });

  const yearlyProfitPieData = yearlyProfit
    ? [
        {
          name: "Tổng chi phí nhập",
          value: yearlyProfit.totalImportCost,
          color: "#ff8042",
        },
        {
          name: "Tổng doanh thu xuất",
          value: yearlyProfit.totalExportRevenue,
          color: "#00C49F",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg">Đang tải dữ liệu dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-destructive">Lỗi tải dữ liệu: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Section 1: Account Overview */}
      <section>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-4">
          Tổng Quan Tài Khoản
        </h3>
        {accountData && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Tài Khoản
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(accountData.totalAccounts)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(accountData.activeAccounts)} đang hoạt động
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tài Khoản Đăng Ký
                </CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(accountData.totalRegisterAccounts)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(accountData.approvedRegisterAccounts)} đã duyệt,{" "}
                  {formatNumber(accountData.pendingRegisterAccounts)} chờ duyệt
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Phân Loại Tài Khoản
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-base font-semibold">
                  {formatNumber(accountData.totalAgencies)} Đại lý
                </div>
                <div className="text-base font-semibold">
                  {formatNumber(accountData.totalSalesManagers)} Quản lý bán
                  hàng
                </div>
                <div className="text-base font-semibold">
                  {formatNumber(accountData.totalWarehouseManagers)} Quản lý kho
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Email Chưa Xác Minh
                </CardTitle>
                <MailWarning className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(accountData.unverifiedEmailCount)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Section 2: Warehouse & Profit Summary */}
      <section>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight my-6">
          Hoạt Động Kho & Lợi Nhuận Năm Nay ({yearlyProfit?.year})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng Nhập Kho
              </CardTitle>
              <PackagePlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(receiptSummary?.totalPrice)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(receiptSummary?.totalReceipts)} phiếu •{" "}
                {formatNumber(receiptSummary?.totalQuantity)} SP
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng Xuất Kho
              </CardTitle>
              <PackageMinus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(exportSummary?.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(exportSummary?.totalExports)} phiếu •{" "}
                {formatNumber(exportSummary?.totalQuantity)} SP
              </p>
            </CardContent>
          </Card>
          {yearlyProfit && (
            <>
              <Card
                className={
                  yearlyProfit.profitAmount >= 0
                    ? "border-green-500"
                    : "border-red-500"
                }
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Lợi Nhuận Năm Nay
                  </CardTitle>
                  <DollarSign
                    className={`h-4 w-4 ${
                      yearlyProfit.profitAmount >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      yearlyProfit.profitAmount >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(yearlyProfit.profitAmount)}
                  </div>
                  <p
                    className={`text-xs ${
                      yearlyProfit.profitAmount >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    } flex items-center`}
                  >
                    {yearlyProfit.profitAmount >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {yearlyProfit.profitPercentage.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Chi Phí / Doanh Thu (Năm)
                  </CardTitle>
                  <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="h-[100px] pt-2">
                  {" "}
                  {/* Adjusted height for pie chart in card */}
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={yearlyProfitPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {yearlyProfitPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Section 3: Detailed Visualizations */}
      <section>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight my-6">
          Phân Tích Chi Tiết
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng xuất kho hàng ngày</CardTitle>
              <CardDescription>
                Số lượng và giá trị xuất kho theo ngày
              </CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng nhập kho hàng ngày</CardTitle>
              <CardDescription>
                Số lượng và giá trị nhập kho theo ngày
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyReceiptChartData}>
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
                    stroke="#ffc658"
                    name="Số lượng nhập"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="price"
                    stroke="#FF8042"
                    name="Giá trị nhập"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Phân tích lợi nhuận hàng tháng</CardTitle>
            <CardDescription>
              So sánh chi phí nhập, doanh thu xuất và lợi nhuận qua các tháng
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyProfitChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="importCost" fill="#ffc658" name="Chi phí nhập" />
                <Bar
                  dataKey="exportRevenue"
                  fill="#82ca9d"
                  name="Doanh thu xuất"
                />
                <Bar dataKey="profit" fill="#8884d8" name="Lợi nhuận" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Detailed Tables (Optional - can be extensive) */}
      <section>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight my-6">
          Bảng Dữ Liệu Chi Tiết
        </h3>
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
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
                  {dailyExportChartData.map((item, idx) => (
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
          <Card>
            <CardHeader>
              <CardTitle>Thống Kê Nhập Kho Hàng Ngày</CardTitle>
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
                  {dailyReceiptChartData.map((item, idx) => (
                    <tr
                      key={`receipt-${idx}`}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-2 font-medium">{item.date}</td>
                      <td className="p-2 text-right">
                        {formatNumber(item.receipts)}
                      </td>
                      <td className="p-2 text-right">
                        {formatNumber(item.quantity)}
                      </td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Báo Cáo Lợi Nhuận Hàng Tháng</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tháng</th>
                  <th className="text-right p-2">Chi Phí Nhập</th>
                  <th className="text-right p-2">Doanh Thu Xuất</th>
                  <th className="text-right p-2">Lợi Nhuận</th>
                  <th className="text-right p-2">Tỷ Lệ Lợi Nhuận</th>
                </tr>
              </thead>
              <tbody>
                {monthlyProfitChartData.map((item, idx) => (
                  <tr
                    key={`profit-month-${idx}`}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="p-2 font-medium">{item.month}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(item.importCost)}
                    </td>
                    <td className="p-2 text-right">
                      {formatCurrency(item.exportRevenue)}
                    </td>
                    <td
                      className={`p-2 text-right font-semibold ${
                        item.profit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(item.profit)}
                    </td>
                    <td
                      className={`p-2 text-right ${
                        item.profitPercentage >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {item.profitPercentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
