"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  FileText,
  Calendar,
  Package,
  ClipboardList,
  CheckCircle,
  Filter,
} from "lucide-react";
import type { WarehouseTransfer } from "@/types/warehouse";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { approveTransfer } from "@/lib/transfer-api";
import { formatDate } from "@/utils/warehouse-utils"; // Only importing formatDate
import { IncomingTransferDetailsDialog } from "./incoming-transfer-details-dialog";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IncomingTransfersProps {
  transfers: WarehouseTransfer[];
  isLoading: boolean;
  onApproved: () => void;
}

export function IncomingTransfers({
  transfers,
  isLoading,
  onApproved,
}: IncomingTransfersProps) {
  const [selectedTransfer, setSelectedTransfer] =
    useState<WarehouseTransfer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleViewDetails = (transfer: WarehouseTransfer) => {
    setSelectedTransfer(transfer);
    setIsDetailsOpen(true);
  };
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, itemsPerPage]);

  const handleApproveConfirm = async () => {
    if (!selectedTransfer) return;

    setIsApproving(true);
    try {
      await approveTransfer(selectedTransfer.id);
      toast.success("Yêu cầu chuyển kho đã được phê duyệt thành công!");
      onApproved();
    } catch (error) {
      console.error("Error approving transfer:", error);
      toast.error("Không thể phê duyệt yêu cầu chuyển kho");
    } finally {
      setIsApproving(false);
      setIsApproveDialogOpen(false);
    }
  };

  // Inline function to get status badge styling and label
  const getStatusBadgeInline = (status: string) => {
    const statusLower = status.toLowerCase();
    let color = "text-gray-800";
    let bgColor = "bg-gray-100";
    let hoverColor = "hover:bg-gray-200";
    let label = status;

    if (statusLower === "completed") {
      color = "text-green-800";
      bgColor = "bg-green-100";
      hoverColor = "hover:bg-green-200";
      label = "Hoàn thành";
    } else if (statusLower === "pending") {
      color = "text-yellow-800";
      bgColor = "bg-yellow-100";
      hoverColor = "hover:bg-yellow-200";
      label = "Chờ xử lí";
    } else if (statusLower === "planned") {
      color = "text-blue-800";
      bgColor = "bg-blue-100";
      hoverColor = "hover:bg-blue-200";
      label = "Đã chọn kho";
    } else if (statusLower === "canceled") {
      color = "text-red-800";
      bgColor = "bg-red-100";
      hoverColor = "hover:bg-red-200";
      label = "Đã hủy";
    } else if (statusLower === "approved") {
      color = "text-teal-800";
      bgColor = "bg-teal-100";
      hoverColor = "hover:bg-teal-200";
      label = "Đã phê duyệt";
    }
    return (
      <Badge className={`${color} ${bgColor} ${hoverColor} transition-colors`}>
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            Không có yêu cầu chuyển đến
          </h3>
          <p className="mt-2 text-center text-muted-foreground">
            Hiện tại không có yêu cầu chuyển kho nào đến kho của bạn.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort transfers by requestDate (newest first)
  const sortedTransfers = [...transfers].sort(
    (a, b) =>
      new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
  );
  const filteredTransfers =
    statusFilter === "all"
      ? sortedTransfers
      : sortedTransfers.filter(
          (transfer) => transfer.status?.toLowerCase() === statusFilter
        );

  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedTransfers = filteredTransfers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center mb-2 gap-2">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ xử lí</SelectItem>
            <SelectItem value="planned">Đã chọn kho</SelectItem>
            <SelectItem value="approved">Đã phê duyệt</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="canceled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Dòng/trang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Mã yêu cầu</TableHead>
              <TableHead>Kho nguồn</TableHead>
              <TableHead>Kho đích</TableHead>
              <TableHead className="text-center">Ngày yêu cầu</TableHead>
              <TableHead className="text-center">Số sản phẩm</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{transfer.warehouseTranferCode}</span>
                  </div>
                </TableCell>

                <TableCell> {transfer.sourceWarehouseName}</TableCell>
                <TableCell> {transfer.destinationWarehouseName}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(transfer.requestDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">
                    <Package className="h-3 w-3 mr-1" />
                    {transfer.products?.length ?? 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadgeInline(transfer.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(transfer)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center px-2 py-3">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredTransfers.length === 0 ? 0 : indexOfFirstItem + 1}
            - {Math.min(indexOfLastItem, filteredTransfers.length)} /{" "}
            {filteredTransfers.length} yêu cầu
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {/* ... (các nút số trang & ... như dưới đây) */}
              {currentPage > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(1)}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <span>...</span>
                  </PaginationItem>
                </>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                )
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {currentPage < totalPages - 2 && (
                <>
                  <PaginationItem>
                    <span>...</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(totalPages)}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages || totalPages === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {selectedTransfer && (
        <IncomingTransferDetailsDialog
          transfer={selectedTransfer}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onApproved={onApproved}
        />
      )}

      <AlertDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Phê duyệt yêu cầu chuyển kho</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn phê duyệt yêu cầu chuyển kho này? Hành động
              này sẽ tạo phiếu xuất kho và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={isApproving}
              className="bg-primary"
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Xác nhận phê duyệt
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
