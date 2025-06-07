"use client";

import { useState } from "react";
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
  Filter,
} from "lucide-react";
import type { WarehouseTransfer } from "@/types/warehouse";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/warehouse-utils"; // Only importing formatDate now
import { OutgoingTransferDetailsDialog } from "./outgoing-transfer-details-dialog";

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

interface OutgoingTransfersProps {
  transfers: WarehouseTransfer[];
  isLoading: boolean;
  onRefresh?: () => void; // Optional callback to refresh data after successful import
}

export function OutgoingTransfers({
  transfers,
  isLoading,
  onRefresh,
}: OutgoingTransfersProps) {
  const [selectedTransfer, setSelectedTransfer] =
    useState<WarehouseTransfer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (transfer: WarehouseTransfer) => {
    setSelectedTransfer(transfer);
    setIsDetailsOpen(true);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");

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
    } else if (statusLower === "approved") {
      color = "text-blue-800";
      bgColor = "bg-blue-100";
      hoverColor = "hover:bg-blue-200";
      label = "Đã phê duyệt";
    } else if (statusLower === "canceled") {
      color = "text-red-800";
      bgColor = "bg-red-100";
      hoverColor = "hover:bg-red-200";
      label = "Đã hủy";
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
            Không có yêu cầu chuyển kho
          </h3>
          <p className="mt-2 text-center text-muted-foreground">
            Bạn chưa có yêu cầu chuyển kho nào. Tạo yêu cầu mới để bắt đầu.
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
      <div className="rounded-md border overflow-x-auto">
        <div className="flex justify-end items-center mb-2 gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lí</SelectItem>
              <SelectItem value="approved">Đã phê duyệt</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Mã yêu cầu</TableHead>
              <TableHead>Kho chuyển</TableHead>
              <TableHead>Kho yêu cầu</TableHead>
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
      </div>

      {selectedTransfer && (
        <OutgoingTransferDetailsDialog
          transfer={selectedTransfer}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onImported={onRefresh}
        />
      )}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="text-sm text-muted-foreground">
          Hiển thị {sortedTransfers.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
          {Math.min(indexOfLastItem, sortedTransfers.length)} /{" "}
          {sortedTransfers.length} yêu cầu
        </div>
        <div className="flex items-center gap-2">
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
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
