"use client";

import { CardFooter } from "@/components/ui/card";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Building,
  Printer,
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
import type { ExportWarehouseReceipt } from "@/types/warehouse";
import { useMediaQuery } from "@/components/hooks/use-media-query";
import { ExportDetail } from "../../export/component/export-detail";

// Add global print styles
const printStyles = `
  @media print {
    /* Hide buttons and footer in print view */
    .DialogFooter,
    button {
      display: none !important;
    }
    
    /* Ensure the dialog content is fully visible */
    .DialogContent {
      max-height: none !important;
      overflow: visible !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      border: none !important;
      box-shadow: none !important;
      background: white !important;
    }
    
    /* Hide dialog backdrop */
    .DialogOverlay {
      background: none !important;
    }
    
    /* Hide any other elements you don't want to print */
    @page {
      size: auto;
      margin: 10mm;
    }
  }
`;

export function ExportReceiptsList() {
  // Add print styles to document
  useEffect(() => {
    // Add print styles to head
    const style = document.createElement("style");
    style.innerHTML = printStyles;
    document.head.appendChild(style);

    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [exportReceipts, setExportReceipts] = useState<
    ExportWarehouseReceipt[]
  >([]);
  const [filteredReceipts, setFilteredReceipts] = useState<
    ExportWarehouseReceipt[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] =
    useState<ExportWarehouseReceipt | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  // ------------------
  // Fetch export receipts
  // ------------------
  const fetchExportReceipts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}WarehouseExport/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setExportReceipts(response.data);
        setFilteredReceipts(response.data);
      } else if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        // Handle the new response format
        setExportReceipts(response.data.data);
        setFilteredReceipts(response.data.data);
      } else {
        toast.error("Dữ liệu không hợp lệ");
        setExportReceipts([]);
        setFilteredReceipts([]);
      }
    } catch (error) {
      console.error("Error fetching export receipts:", error);
      setExportReceipts([]);
      setFilteredReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi fetch một lần khi component mount
  useEffect(() => {
    fetchExportReceipts();
  }, []);

  // ------------------
  // Filter and paginate export receipts
  // ------------------
  useEffect(() => {
    const filtered = exportReceipts.filter((receipt) => {
      const matchesSearch =
        receipt.documentNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        receipt.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.exportWarehouseReceiptId.toString().includes(searchTerm) ||
        receipt.details.some(
          (detail) =>
            detail.productName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            detail.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" ||
        receipt.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedReceipts = filtered.slice(indexOfFirstItem, indexOfLastItem);

    setFilteredReceipts(paginatedReceipts);
  }, [searchTerm, statusFilter, exportReceipts, currentPage, itemsPerPage]);

  // ------------------
  // Các hàm xử lý hiển thị
  // ------------------
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
    if (statusLower === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Đã xuất kho
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
          Đang xử lý
        </Badge>
      );
    } else if (statusLower === "requested") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Đang yêu cầu
        </Badge>
      );
    } else if (statusLower === "canceled") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Từ chối
        </Badge>
      );
    } else if (statusLower === "partially_exported") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Chưa đủ hàng
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

  const getProductNames = (receipt: ExportWarehouseReceipt) => {
    return receipt.details
      .map((detail) => {
        return `${detail.productName} (${detail.quantity})`;
      })
      .join(", ");
  };

  const handleViewDetail = (receipt: ExportWarehouseReceipt) => {
    setSelectedReceipt(receipt);
    setIsDetailOpen(true);
  };

  // Print export receipt
  const handlePrint = () => {
    if (!selectedReceipt) return;
    window.print();
  };

  const RequestCard = ({ receipt }: { receipt: ExportWarehouseReceipt }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
              <CardTitle className="text-base">
                PXK #{receipt.exportWarehouseReceiptId}
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="font-mono">{receipt.documentNumber}</span>
              </div>
            </CardDescription>
          </div>
          {getStatusBadge(receipt.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Sản phẩm:</p>
            <p
              className="font-medium truncate"
              title={getProductNames(receipt)}
            >
              <Package className="h-3 w-3 mr-1 inline text-muted-foreground" />
              {getProductNames(receipt)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground text-xs">Ngày xuất:</p>
              <p className="font-medium">
                <Calendar className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {formatDate(receipt.exportDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Số lượng:</p>
              <p className="font-medium">
                <Package className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {receipt.totalQuantity.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => handleViewDetail(receipt)}
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
            placeholder="Tìm theo mã đơn, sản phẩm..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Đang xử lý</SelectItem>
              <SelectItem value="completed">Đã xuất kho</SelectItem>
              <SelectItem value="requested">Đang yêu cầu</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number.parseInt(value));
              setCurrentPage(1);
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
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Đang tải...</span>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-8">
              Không tìm thấy phiếu xuất kho nào
            </div>
          ) : (
            filteredReceipts.map((receipt) => (
              <RequestCard
                key={receipt.exportWarehouseReceiptId}
                receipt={receipt}
              />
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Số chứng từ</TableHead>
                <TableHead className="w-[180px]">Mã đơn hàng</TableHead>
                <TableHead className="w-[180px]">Tên đại lý</TableHead>
                {!isTablet && <TableHead>Sản phẩm</TableHead>}
                <TableHead className="text-center">Ngày xuất</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={isTablet ? 8 : 9}
                    className="text-center h-24"
                  >
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isTablet ? 8 : 9}
                    className="text-center h-24"
                  >
                    Không tìm thấy phiếu xuất kho nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.exportWarehouseReceiptId}>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-xs font-mono">
                          {receipt.documentNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-xs font-mono">
                          {receipt.orderCode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-500" />
                        {receipt.agencyName}
                      </div>
                    </TableCell>
                    {!isTablet && (
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span
                            className="truncate max-w-[250px]"
                            title={getProductNames(receipt)}
                          >
                            {getProductNames(receipt)}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(receipt.exportDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                        {receipt.totalQuantity.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(receipt.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(receipt)}
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
          {Math.min(currentPage * itemsPerPage, exportReceipts.length)} /{" "}
          {exportReceipts.length} phiếu xuất
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
              { length: Math.ceil(exportReceipts.length / itemsPerPage) },
              (_, i) => i + 1
            )
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(
                  Math.ceil(exportReceipts.length / itemsPerPage),
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
              Math.ceil(exportReceipts.length / itemsPerPage) - 2 && (
              <>
                <PaginationItem>
                  <span>...</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() =>
                      setCurrentPage(
                        Math.ceil(exportReceipts.length / itemsPerPage)
                      )
                    }
                    className="cursor-pointer"
                  >
                    {Math.ceil(exportReceipts.length / itemsPerPage)}
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
                      Math.ceil(exportReceipts.length / itemsPerPage)
                    )
                  )
                }
                className={
                  currentPage ===
                  Math.ceil(exportReceipts.length / itemsPerPage)
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {selectedReceipt && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[1000px]">
            <DialogHeader>
              <DialogTitle>Chi tiết phiếu xuất kho</DialogTitle>
            </DialogHeader>
            <div
              className="space-y-6"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
              {/* Import and use the ExportDetail component */}
              {selectedReceipt && (
                <div className="mt-4">
                  <ExportDetail
                    exportData={selectedReceipt}
                    onApproved={() => {
                      // Close the dialog
                      setIsDetailOpen(false);
                      // Refresh the list
                      fetchExportReceipts();
                      // Update the local state to reflect changes immediately
                      setExportReceipts((prevReceipts) =>
                        prevReceipts.map((receipt) =>
                          receipt.exportWarehouseReceiptId ===
                          selectedReceipt.exportWarehouseReceiptId
                            ? { ...receipt, status: "APPROVED" }
                            : receipt
                        )
                      );
                      toast.success("Phiếu xuất kho đã được duyệt thành công");
                    }}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                In phiếu xuất
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
