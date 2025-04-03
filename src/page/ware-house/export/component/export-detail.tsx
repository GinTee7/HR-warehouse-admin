"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Loader2,
  Package,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

// Cập nhật interface ExportDetailProps để khớp chính xác với API
interface ExportDetailProps {
  exportData: {
    exportWarehouseReceiptId: number;
    documentNumber: string;
    documentDate: string;
    exportDate: string;
    exportType: string;
    totalQuantity: number;
    totalAmount: number;
    requestExportId: number;
    agencyName: string;
    orderCode: number;
    status: string;
    warehouseId: number;
    exportWarehouseReceiptDetails: ExportReceiptDetail[];
  };
  onApproved?: () => void;
}

// Interface cho chi tiết phiếu xuất
interface ExportReceiptDetail {
  exportWarehouseReceiptDetailId: number;
  exportWarehouseReceiptId: number;
  warehouseProductId: number;
  productId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalProductAmount: number;
  expiryDate: string;
}

export function ExportDetail({
  exportData: initialExportData,
  onApproved,
}: ExportDetailProps) {
  const [exportData, setExportData] = useState(initialExportData);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<ExportReceiptDetail | null>(null);

  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      console.log("Error parsing date:", error);
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed" || statusLower === "approved") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Hoàn thành
        </Badge>
      );
    } else if (statusLower === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          Đang xử lý
        </Badge>
      );
    } else if (statusLower === "cancelled" || statusLower === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Đã hủy
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          {status}
        </Badge>
      );
    }
  };

  // Mở dialog duyệt đơn
  const openApprovalDialog = (detail: ExportReceiptDetail) => {
    setSelectedDetail(detail);
    setIsApprovalDialogOpen(true);
  };

  // Xử lý duyệt đơn - Cập nhật để sử dụng exportWarehouseReceiptId
  const handleApprove = async () => {
    if (!selectedDetail) return;
    setIsLoading(false);
    setIsApproving(true);
    try {
      // Gọi API duyệt đơn với exportWarehouseReceiptId
      const response = await axios.put(
        `${API_URL}export-receipts/${exportData.exportWarehouseReceiptId}/approve`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 204
      ) {
        toast.success("Duyệt đơn xuất kho thành công");
        setIsApprovalDialogOpen(false);

        // Cập nhật trạng thái ngay lập tức
        setExportData((prevData) => ({
          ...prevData,
          status: "APPROVED",
        }));

        // Gọi callback để cập nhật UI
        if (onApproved) {
          onApproved();
        }
      } else {
        throw new Error("Duyệt đơn xuất kho thất bại");
      }
    } catch (error) {
      console.error("Error approving export:", error);
      toast.error("Không thể duyệt đơn xuất kho. Vui lòng thử lại sau.");
    } finally {
      setIsApproving(false);
    }
  };

  // Kiểm tra xem đơn có thể duyệt không
  const canApprove = exportData.status.toLowerCase() === "pending";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Thông tin phiếu xuất
              </h3>

              {canApprove && (
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() =>
                    openApprovalDialog(
                      exportData.exportWarehouseReceiptDetails[0]
                    )
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Duyệt đơn xuất kho
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã phiếu xuất:</div>
                <div className="text-sm">{exportData.documentNumber}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Ngày tạo:</div>
                <div className="text-sm">
                  {formatDate(exportData.documentDate)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Ngày xuất:</div>
                <div className="text-sm">
                  {formatDate(exportData.exportDate)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Loại xuất:</div>
                <div className="text-sm">{exportData.exportType}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã đơn hàng:</div>
                <div className="text-sm">{exportData.orderCode}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã yêu cầu xuất:</div>
                <div className="text-sm">{exportData.requestExportId}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Kho xuất:</div>
                <div className="text-sm">Kho {exportData.warehouseId}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Trạng thái:</div>
                <div className="text-sm">
                  {getStatusBadge(exportData.status)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
          <Package className="h-4 w-4 mr-2" />
          Chi tiết sản phẩm
        </h3>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải chi tiết sản phẩm...</span>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã SP</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Mã lô</TableHead>
                  <TableHead className="text-center">Hạn sử dụng</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-center">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportData.exportWarehouseReceiptDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.productId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {item.productName}
                      </div>
                    </TableCell>
                    <TableCell>{item.batchNumber}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {formatDate(item.expiryDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {item.quantity.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        {item.unitPrice.toLocaleString()} đ
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.totalProductAmount.toLocaleString()} đ
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    colSpan={canApprove ? 7 : 6}
                    className="text-right font-medium"
                  >
                    Tổng giá trị:
                  </TableCell>
                  <TableCell
                    className="text-right font-bold"
                    colSpan={canApprove ? 1 : 1}
                  >
                    {exportData.totalAmount.toLocaleString()} VNĐ
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Ghi chú
        </h3>
        <p className="text-sm text-muted-foreground">
          {exportData.status.toLowerCase() === "completed" ||
          exportData.status.toLowerCase() === "approved"
            ? "Hàng đã được kiểm tra chất lượng và xuất kho thành công."
            : "Phiếu xuất đang trong quá trình xử lý. Vui lòng kiểm tra lại sau."}
        </p>
      </div>

      {/* Dialog duyệt đơn xuất kho - Đơn giản hóa vì chỉ cần ID */}
      <Dialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Duyệt đơn xuất kho</DialogTitle>
            <DialogDescription>
              Xác nhận duyệt phiếu xuất này?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exportId" className="text-right">
                Mã phiếu xuất
              </Label>
              <div className="col-span-3 font-medium">
                {exportData.exportWarehouseReceiptId}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="documentNumber" className="text-right">
                Số phiếu
              </Label>
              <div className="col-span-3">{exportData.documentNumber}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalQuantity" className="text-right">
                Tổng số lượng
              </Label>
              <div className="col-span-3">
                {exportData.totalQuantity.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalAmount" className="text-right">
                Tổng giá trị
              </Label>
              <div className="col-span-3">
                {exportData.totalAmount.toLocaleString()} đ
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApprovalDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Xác nhận duyệt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
