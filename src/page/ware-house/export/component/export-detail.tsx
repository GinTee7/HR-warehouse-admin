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
import { useState, useEffect } from "react"; // Added useEffect
import {
  Loader2,
  Package,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  XCircle,
  MessageSquareWarning,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Interface cho chi tiết phiếu xuất
interface ExportReceiptDetailInterface {
  warehouseProductId: number;
  productId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalProductAmount: number;
  expiryDate: string;
  exportWarehouseReceiptId?: number;
  warehouseName?: string;
  discount: number;
  finalPrice: number;
  reason?: string;
  productCode?: string;
}

// Interface cho props của component
interface ExportDetailProps {
  exportData: {
    documentNumber: string;
    documentDate: string;
    exportDate: string;
    exportType: string;
    totalQuantity: number;
    totalAmount: number;
    status: string;
    warehouseId: number;
    requestExportId: number;
    orderCode: string;
    agencyName: string;
    details: ExportReceiptDetailInterface[];
    exportWarehouseReceiptId: number;
    warehouseName: string;
    reason?: string;
    discount: number;
    finalPrice: number;
  };
  onActionCompleted?: () => void;
  onApproved?: () => void;
}

export function ExportDetail({
  // Component name is ExportDetail
  exportData: initialExportData,
  onActionCompleted,
}: ExportDetailProps) {
  const [exportData, setExportData] = useState(initialExportData);
  const [isLoading] = useState(false); // For loading product details
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const REJECT_API_URL = "https://minhlong.mlhr.org";

  // **Important:** Sync state if initialExportData prop changes
  useEffect(() => {
    console.log(
      "ExportDetail: initialExportData prop received:",
      initialExportData
    );
    setExportData(initialExportData);
  }, [initialExportData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      console.log("Error parsing date:", error);
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed" || statusLower === "approved") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Đã xuất kho
        </Badge>
      );
    } else if (statusLower === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          Đang xử lý
        </Badge>
      );
    } else if (statusLower === "canceled" || statusLower === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Từ chối
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

  const openApprovalDialog = () => {
    setIsApprovalDialogOpen(true);
  };

  const openRejectDialog = () => {
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    // setIsLoading(false); // This line was incorrect; setIsLoading is for product details loading.
    setIsApproving(true);
    console.log(
      "ExportDetail: Handling Approve. Using exportWarehouseReceiptId:",
      exportData.exportWarehouseReceiptId,
      "Current full exportData:",
      exportData
    );
    try {
      const response = await axios.post(
        `${API_BASE_URL}WarehouseExport/finalize-export-sale/${exportData.exportWarehouseReceiptId}`,
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
        setExportData((prevData) => ({
          ...prevData,
          status: "APPROVED",
        }));
        window.location.reload();
        if (onActionCompleted) {
          onActionCompleted();
        }
      } else {
        throw new Error("Duyệt đơn xuất kho thất bại");
      }
    } catch (error: any) {
      console.error(
        "Error approving export:",
        error?.response?.data?.message || error.message || "Unknown error"
      );
      toast.error(
        error?.response?.data?.message || "Đã xảy ra lỗi khi duyệt đơn xuất kho"
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    setIsRejecting(true);
    console.log(
      "ExportDetail: Handling Reject. Using requestExportId:",
      exportData.requestExportId,
      "Current full exportData:",
      exportData
    );
    try {
      const apiUrl = `${REJECT_API_URL}/api/WarehouseExport/cancel-WarehouseRequest-Export`;
      const payload = {
        warehouseRequestExportId: exportData.exportWarehouseReceiptId,
        reason: rejectionReason,
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 204
      ) {
        toast.success("Từ chối phiếu xuất thành công.");
        window.location.reload();
        setIsRejectDialogOpen(false);
        setExportData((prevData) => ({
          ...prevData,
          status: "CANCELLED",
        }));
        if (onActionCompleted) {
          onActionCompleted();
        }
      } else {
        toast.error(response.data?.message || "Từ chối phiếu xuất thất bại.");
      }
    } catch (error: any) {
      console.error(
        "Error rejecting export request:",
        error?.response?.data || error.message
      );
      toast.error(
        error?.response?.data?.message ||
          "Đã xảy ra lỗi khi từ chối phiếu xuất."
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const canProcess = exportData.status.toLowerCase() === "pending";

  const getImportTypeDisplay = (importType: string) => {
    switch (importType) {
      case "ExportCoordination":
        return "Xuất điều phối";
      case "ExportSale":
        return "Xuất bán hàng";
      case "PendingTransfer":
        return "Chờ điều phối";
      case "AvailableExport":
        return "Sẵn hàng";
      default:
        return importType;
    }
  };

  // Check if exportData is available before rendering to prevent errors
  if (!exportData) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải dữ liệu phiếu xuất...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card>
          <CardContent className="pt-6">
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
                <div className="text-sm">
                  {getImportTypeDisplay(exportData.exportType)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã đơn hàng:</div>
                <div className="text-sm">{exportData.orderCode}</div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Kho xuất:</div>
                <div className="text-sm">{exportData.warehouseName}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Trạng thái:</div>
                <div className="text-sm">
                  {getStatusBadge(exportData.status)}
                </div>
              </div>
              {exportData.status.toLowerCase() === "canceled" && (
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">Lý do:</div>
                  <div className="text-sm break-words whitespace-pre-line">
                    {exportData.reason}
                  </div>
                </div>
              )}
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
                {exportData.details.map((item, index) => (
                  <TableRow key={`${item.productId}-${index}`}>
                    {" "}
                    {/* More robust key */}
                    <TableCell className="font-medium">
                      {item.productCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {item.productName}
                      </div>
                    </TableCell>
                    <TableCell>{item.batchNumber}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
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
                  <TableCell colSpan={6} className="text-right font-medium">
                    Tổng tiền:
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${
                      exportData.discount > 0
                        ? "line-through text-gray-500"
                        : ""
                    }`}
                  >
                    {exportData.totalAmount.toLocaleString()} đ
                  </TableCell>
                </TableRow>
                {exportData.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-right font-medium">
                      Giảm giá:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {exportData.discount}%
                    </TableCell>
                  </TableRow>
                )}
                {exportData.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-right font-medium">
                      Tổng tiền sau giảm giá:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {exportData.finalPrice.toLocaleString()} đ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Separator />

      <div>
        <div className="flex space-x-2 float-end">
          {exportData.exportType === "PendingTransfer" && (
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/warehouse/transfer-request")}
            >
              <Download className="h-4 w-4 mr-2" />
              Nhập điều phối
            </Button>
          )}
          {canProcess && (
            <>
              {exportData.exportType === "AvailableExport" && (
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 mr-2"
                  onClick={openApprovalDialog}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Duyệt đơn xuất kho
                </Button>
              )}

              <Button variant="destructive" onClick={openRejectDialog}>
                <XCircle className="h-4 w-4 mr-2" />
                Từ chối
              </Button>
            </>
          )}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Ghi chú
        </h3>
        <p className="text-sm text-muted-foreground">
          {exportData.status.toLowerCase() === "completed" ||
          exportData.status.toLowerCase() === "approved"
            ? "Hàng đã được kiểm tra chất lượng và xuất kho thành công."
            : exportData.status.toLowerCase() === "cancelled" ||
              exportData.status.toLowerCase() === "rejected"
            ? "Phiếu xuất đã bị hủy/từ chối."
            : "Phiếu xuất đang trong quá trình xử lý. Vui lòng kiểm tra lại sau."}
        </p>
      </div>

      {/* Dialog duyệt đơn xuất kho */}
      <Dialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
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
                {exportData.documentNumber}
              </div>
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
                {exportData.finalPrice.toLocaleString()} đ
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

      {/* Dialog từ chối đơn xuất kho */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Từ chối phiếu xuất kho</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn từ chối phiếu xuất này không? Vui lòng cung
              cấp lý do.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rejectReason" className="text-right">
                <MessageSquareWarning className="inline h-4 w-4 mr-1" />
                Lý do từ chối
              </Label>
              <Textarea
                id="rejectReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="col-span-3"
                placeholder="Nhập lý do từ chối..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Mã phiếu xuất</Label>
              <div className="col-span-3 font-medium">
                {exportData.documentNumber}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
              variant="destructive"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Xác nhận từ chối
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
