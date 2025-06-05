"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Loader2,
  Package,
  Calendar,
  Filter,
  ClipboardList,
  RefreshCcw,
  CheckCircle,
  CircleX,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { ReturnWarehouseReceipt } from "@/types/warehouse";
import { useMediaQuery } from "@/components/hooks/use-media-query";
import { ReturnRequestDetail } from "./return-request-detail";

interface ReturnRequestsListProps {
  returnRequests: ReturnWarehouseReceipt[];
  isLoading: boolean;
  onRefresh: () => void;
  onProcessed: () => void;
}

export function ReturnRequestsList({
  returnRequests,
  isLoading,
  onRefresh,
  onProcessed,
}: ReturnRequestsListProps) {
  const [filteredRequests, setFilteredRequests] = useState<
    ReturnWarehouseReceipt[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] =
    useState<ReturnWarehouseReceipt | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "https://api.example.com/";

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Mở modal từ chối
  const handleRejectReturn = () => {
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Update filtered requests when returnRequests changes
  useEffect(() => {
    filterRequests();
  }, [returnRequests, searchTerm, statusFilter]);

  // Filter return requests
  const filterRequests = () => {
    const filtered = returnRequests.filter((request) => {
      const matchesSearch =
        request.receiptCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.returnWarehouseReceiptId
          .toString()
          .includes(searchTerm.toLowerCase()) ||
        request.details.some((detail) =>
          detail.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Make sure status comparison is case-insensitive
      const requestStatus = request.status.toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && requestStatus === "pending") ||
        (statusFilter === "imported" && requestStatus === "imported");

      return matchesSearch && matchesStatus;
    });

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedRequests = filtered.slice(indexOfFirstItem, indexOfLastItem);

    setFilteredRequests(paginatedRequests);
  };

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

  // Get product names from return request
  const getProductNames = (request: ReturnWarehouseReceipt) => {
    return request.details
      .map((detail) => {
        return `${detail.productName} (${detail.quantity})`;
      })
      .join(", ");
  };

  // Handle view detail
  const handleViewDetail = (request: ReturnWarehouseReceipt) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  // Handle approve return request
  const handleApproveReturn = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${API_URL}returns/${selectedRequest.returnWarehouseReceiptId}/Import-Damage-Stock`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        onProcessed();
        setIsDetailOpen(false);
      } else {
        throw new Error("Không thể duyệt yêu cầu trả hàng");
      }
    } catch (error: any) {
      console.error("Error approving return:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý submit từ chối
  const handleSubmitReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${API_URL}returns/reject-WarehouseReturn-Request/${selectedRequest.returnWarehouseReceiptId}`,
        { reason: rejectReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        onProcessed();
        setIsRejectModalOpen(false);
        setIsDetailOpen(false);
      } else {
        throw new Error("Không thể từ chối yêu cầu trả hàng");
      }
    } catch (error: any) {
      console.error("Error rejecting return:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setIsProcessing(false);
    }
  };

  // Return request card for mobile view
  const RequestCard = ({ request }: { request: ReturnWarehouseReceipt }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
              <CardTitle className="text-base">{request.receiptCode}</CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="font-mono">
                  ID: {request.returnWarehouseReceiptId}
                </span>
              </div>
            </CardDescription>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Sản phẩm:</p>
            <p
              className="font-medium truncate"
              title={getProductNames(request)}
            >
              <Package className="h-3 w-3 mr-1 inline text-muted-foreground" />
              {getProductNames(request)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground text-xs">Ngày tạo:</p>
              <p className="font-medium">
                <Calendar className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {formatDate(request.receiptDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Ghi chú:</p>
              <p className="font-medium">{request.note || "N/A"}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => handleViewDetail(request)}
        >
          <FileText className="h-4 w-4 mr-1" />
          Chi tiết
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-[250px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo mã phiếu, sản phẩm..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              filterRequests();
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              filterRequests();
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lí</SelectItem>
              <SelectItem value="imported">Đã nhập kho</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number.parseInt(value));
              setCurrentPage(1);
              filterRequests();
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Đang tải...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              Không tìm thấy phiếu trả hàng nào
            </div>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard
                key={request.returnWarehouseReceiptId}
                request={request}
              />
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Mã phiếu</TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[150px]">Ngày tạo</TableHead>
                {!isTablet && <TableHead>Sản phẩm</TableHead>}
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={isTablet ? 6 : 7}
                    className="text-center h-24"
                  >
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isTablet ? 6 : 7}
                    className="text-center h-24"
                  >
                    Không tìm thấy phiếu trả hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.returnWarehouseReceiptId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-xs font-mono">
                          {request.receiptCode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-xs font-mono">
                          {request.returnWarehouseReceiptId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(request.receiptDate)}
                      </div>
                    </TableCell>
                    {!isTablet && (
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span
                            className="truncate max-w-[250px]"
                            title={getProductNames(request)}
                          >
                            {getProductNames(request)}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(request)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-between items-center border-t px-4 sm:px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
          {Math.min(currentPage * itemsPerPage, returnRequests.length)} /{" "}
          {returnRequests.length} phiếu trả hàng
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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

            {Array.from(
              { length: Math.ceil(returnRequests.length / itemsPerPage) },
              (_, i) => i + 1
            )
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(
                  Math.ceil(returnRequests.length / itemsPerPage),
                  currentPage + 2
                )
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

            {currentPage <
              Math.ceil(returnRequests.length / itemsPerPage) - 2 && (
              <>
                <PaginationItem>
                  <span>...</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() =>
                      setCurrentPage(
                        Math.ceil(returnRequests.length / itemsPerPage)
                      )
                    }
                    className="cursor-pointer"
                  >
                    {Math.ceil(returnRequests.length / itemsPerPage)}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(returnRequests.length / itemsPerPage)
                    )
                  )
                }
                className={
                  currentPage ===
                  Math.ceil(returnRequests.length / itemsPerPage)
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {selectedRequest && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[1200px]">
            <DialogHeader>
              <DialogTitle>Chi tiết phiếu trả hàng</DialogTitle>
            </DialogHeader>

            <ReturnRequestDetail request={selectedRequest} />

            <DialogFooter className="flex justify-between items-center">
              {selectedRequest.status.toLowerCase() === "pending" && (
                <>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApproveReturn}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Duyệt yêu cầu
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRejectReturn}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CircleX className="h-4 w-4 mr-2" />
                    )}
                    Từ chối
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Modal nhập lý do từ chối */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập lý do từ chối</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleSubmitReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CircleX className="h-4 w-4 mr-2" />
              )}
              Gửi
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isProcessing}
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
