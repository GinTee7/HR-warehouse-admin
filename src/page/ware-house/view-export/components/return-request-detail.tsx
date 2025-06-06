import { Package, Tag, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ReturnWarehouseReceipt } from "@/types/warehouse";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ReturnRequestDetailProps {
  request: ReturnWarehouseReceipt;
}

export function ReturnRequestDetail({ request }: ReturnRequestDetailProps) {
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
    if (statusLower === "approved") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Đã duyệt
        </Badge>
      );
    } else if (statusLower === "processing") {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          Đang xử lý
        </Badge>
      );
    } else if (statusLower === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Chờ xử lí
        </Badge>
      );
    } else if (statusLower === "imported") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Đã nhập kho
        </Badge>
      );
    } else if (statusLower === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Đã từ chối
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          {status}
        </Badge>
      );
    }
  };

  // Calculate total quantity
  const getTotalQuantity = () => {
    return request.details.reduce((sum, detail) => sum + detail.quantity, 0);
  };

  return (
    <div className="space-y-6" style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Thông tin phiếu trả hàng
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã phiếu:</div>
                <div className="text-sm font-mono text-xs">
                  {request.receiptCode}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã đơn hàng:</div>
                <div className="text-sm ">{request.orderCode}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Ngày tạo:</div>
                <div className="text-sm">{formatDate(request.receiptDate)}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã yêu cầu trả:</div>
                <div className="text-sm">
                  {request.returnRequestCode || "N/A"}
                </div>
              </div>
              {request.status?.toLowerCase() === "rejected" && (
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium">Lý do:</div>
                  <div className="text-sm">{request.reason || "N/A"}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Trạng thái:</div>
                <div className="text-sm">{getStatusBadge(request.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Tổng số lượng:</div>
                <div className="text-sm">
                  {getTotalQuantity().toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {request.images && request.images.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Ảnh liên quan
            </h3>
            <div className="flex gap-4 overflow-x-auto">
              {request.images.map((img) => (
                <Dialog key={img.returnRequestImageId}>
                  <DialogTrigger asChild>
                    <img
                      src={img.imageUrl}
                      alt={`Ảnh trả hàng ${request.receiptCode}`}
                      className="h-24 w-auto rounded border cursor-pointer"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] p-0">
                    <img
                      src={img.imageUrl}
                      alt={`Ảnh trả hàng ${request.receiptCode}`}
                      className="w-full max-h-[90vh] object-contain rounded"
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Separator />
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
          <Package className="h-4 w-4 mr-2" />
          Chi tiết sản phẩm trả
        </h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID chi tiết</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Lý do trả</TableHead>
                <TableHead>Mã lô</TableHead>
                <TableHead className="text-center">Số lượng trả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.details.map((detail) => (
                <TableRow key={detail.returnWarehouseReceiptDetailId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-xs font-mono">
                        {detail.returnWarehouseReceiptDetailId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{detail.productName}</TableCell>
                  <TableCell>{detail.reason}</TableCell>
                  <TableCell>{detail.batchCode}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                      {detail.quantity.toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  Tổng số lượng:
                </TableCell>
                <TableCell className="text-center font-bold">
                  {getTotalQuantity().toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
