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
import { FileText, Package, Tag, Banknote } from "lucide-react";

// Interface cho dữ liệu chi tiết sản phẩm
interface ProductDetail {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  defaultExpiration: number;
  categoryId: number;
  description: string;
  taxId: number;
  createdBy: string;
  createdDate: string;
  availableStock: number;
  price: number;
  images: string[];
}

// Interface cho chi tiết yêu cầu xuất
interface RequestExportDetail {
  requestExportDetailId: number;
  productId: number;
  requestedQuantity: number;
  productDetail?: ProductDetail;
}

// Interface cho yêu cầu xuất
interface RequestExport {
  requestExportId: number;
  orderId: string;
  requestedBy: number;
  approvedBy: number;
  status: string;
  approvedDate: string;
  note: string;
  requestExportDetails: RequestExportDetail[];
  requestExportCode: string;
}

interface ExportRequestDetailProps {
  request: RequestExport;
  productCache: Map<number, ProductDetail>;
}

export function ExportRequestDetail({
  request,
  productCache,
}: ExportRequestDetailProps) {
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
          Hoàn thành
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
          Chờ xử lý
        </Badge>
      );
    } else if (statusLower === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Đã hủy
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
    return request.requestExportDetails.reduce(
      (sum, detail) => sum + detail.requestedQuantity,
      0
    );
  };

  // Calculate total value
  const getTotalValue = () => {
    return request.requestExportDetails.reduce((sum, detail) => {
      const price = detail.productDetail?.price || 0;
      return sum + detail.requestedQuantity * price;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Thông tin yêu cầu
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã yêu cầu:</div>
                <div className="text-sm">{request.requestExportId}</div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Mã đơn hàng:</div>
                <div className="text-sm font-mono text-xs">
                  {request.requestExportCode}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Ngày duyệt:</div>
                <div className="text-sm">
                  {formatDate(request.approvedDate)}
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Tổng giá trị:</div>
                <div className="text-sm">
                  {getTotalValue().toLocaleString()} đ
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="text-sm font-medium">Ghi chú:</div>
                <div className="text-sm">
                  {request.note || "Không có ghi chú"}
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã SP</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead className="text-center">Đơn giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.requestExportDetails.map((detail) => {
                const product =
                  detail.productDetail || productCache.get(detail.productId);
                const price = product?.price || 0;
                const total = detail.requestedQuantity * price;

                return (
                  <TableRow key={detail.requestExportDetailId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        {product?.productCode || `SP${detail.productId}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product?.productName || `Sản phẩm ${detail.productId}`}
                    </TableCell>
                    <TableCell>{product?.unit || "Cái"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                        {detail.requestedQuantity.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Banknote className="h-4 w-4 mr-2 text-muted-foreground" />
                        {price.toLocaleString()} đ
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {total.toLocaleString()} đ
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-medium">
                  Tổng giá trị:
                </TableCell>
                <TableCell className="text-right font-bold">
                  {getTotalValue().toLocaleString()} đ
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
