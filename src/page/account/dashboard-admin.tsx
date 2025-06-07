import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageMinus, PackagePlus, TrendingUp, TrendingDown, LineChart } from "lucide-react";
import { AccountOverview } from "@/components/dashboard/AccountOverview";
import { ExportSummary } from "@/components/dashboard/ExportSummary";
import { ReceiptSummary } from "@/components/dashboard/ReceiptSummary";
import { ProfitSummary } from "@/components/dashboard/ProfitSummary";
import { YearlyProfitSummary } from "@/components/dashboard/YearlyProfitSummary";

interface ExportSummaryData {
  totalAmount: number;
  totalExports: number;
  totalQuantity: number;
}

interface ReceiptSummaryData {
  totalPrice: number;
  totalReceipts: number;
  totalQuantity: number;
}

interface ProfitSummaryData {
  totalProfit: number;
  totalExportRevenue: number;
  totalImportCost: number;
  year: number;
}

interface YearlyProfitSummaryData {
  profitAmount: number;
  profitPercentage: number;
  year: number;
}

export default function AdminDashboard() {
  const [exportData, setExportData] = useState<ExportSummaryData | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptSummaryData | null>(null);
  const [profitData, setProfitData] = useState<ProfitSummaryData | null>(null);
  const [yearlyProfitData, setYearlyProfitData] = useState<YearlyProfitSummaryData | null>(null);

  const handleExportDataChange = (data: ExportSummaryData) => {
    setExportData(data);
  };

  const handleReceiptDataChange = (data: ReceiptSummaryData) => {
    setReceiptData(data);
  };

  const handleProfitDataChange = (data: ProfitSummaryData) => {
    setProfitData(data);
  };

  const handleYearlyProfitDataChange = (data: YearlyProfitSummaryData) => {
    setYearlyProfitData(data);
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

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "N/A";
    return `${value.toFixed(2)}%`;
  };

  const getValueColor = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "text-black";
    if (value === 0) return "text-black";
    return value > 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AccountOverview />

        <Card className="bg-orange-50 border-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Nhập Kho
            </CardTitle>
            <PackagePlus className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getValueColor(receiptData?.totalPrice)}`}>
              {formatCurrency(receiptData?.totalPrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(receiptData?.totalReceipts)} phiếu •{" "}
              {formatNumber(receiptData?.totalQuantity)} Sản phẩm
            </p>
          </CardContent>
        </Card>

        <Card className="bg-cyan-50 border-cyan-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Xuất Kho
            </CardTitle>
            <PackageMinus className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getValueColor(exportData?.totalAmount)}`}>
              {formatCurrency(exportData?.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(exportData?.totalExports)} phiếu •{" "}
              {formatNumber(exportData?.totalQuantity)} Sản phẩm
            </p>
          </CardContent>
        </Card>

        <Card className={`${(profitData?.totalProfit ?? 0) >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lợi Nhuận Năm {profitData?.year}
            </CardTitle>
            {profitData?.totalProfit && profitData.totalProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getValueColor(profitData?.totalProfit)}`}>
              {formatCurrency(profitData?.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span> Doanh thu: <span className={getValueColor(profitData?.totalExportRevenue)}>{formatCurrency(profitData?.totalExportRevenue)}</span></span>
              <span> Chi phí:  <span className={getValueColor(-(profitData?.totalImportCost || 0))}>{formatCurrency(profitData?.totalImportCost)}</span></span>
            </p>
          </CardContent>
        </Card>

        <Card className={`${(yearlyProfitData?.profitAmount ?? 0) >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ lợi nhuận Năm {yearlyProfitData?.year}
            </CardTitle>
            <LineChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getValueColor(yearlyProfitData?.profitAmount)}`}>
              {formatPercentage(yearlyProfitData?.profitPercentage)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <ExportSummary onDataChange={handleExportDataChange} />
        <ReceiptSummary onDataChange={handleReceiptDataChange} />
        <YearlyProfitSummary onDataChange={handleYearlyProfitDataChange} />
        <ProfitSummary onDataChange={handleProfitDataChange} />


      </div>

    </div>
  );
}
