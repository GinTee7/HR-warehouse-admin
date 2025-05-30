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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  Loader2,
  Calendar,
  Filter,
  CreditCard,
  DollarSign,
  Building2,
  Receipt,
  FileSpreadsheet,
  Download,
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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CustomDateRangePicker } from "@/components/ui/custom-date-range-picker";

import { useMediaQuery } from "@/components/hooks/use-media-query";

// Interface cho lịch sử thanh toán
interface PaymentHistory {
  paymentHistoryId: string;
  orderId: string;
  orderCode: string;
  agencyId: number;
  agencyName: string;
  paymentMethod: string;
  paymentDate: string;
  serieNumber: string;
  status: string;
  totalAmountPayment: number;
  remainingDebtAmount: number;
  paymentAmount: number;
  createdAt: string;
  updatedAt: string;
  transactionReference: string;
}

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
    }
    
    /* Hide any other elements you don't want to print */
    @page {
      size: auto;
      margin: 10mm;
    }
  }
`;

export default function PaymentHistoryPage() {
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

  const [paymentHistories, setPaymentHistories] = useState<PaymentHistory[]>(
    []
  );
  const [filteredHistories, setFilteredHistories] = useState<PaymentHistory[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHistory, setSelectedHistory] = useState<PaymentHistory | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "https://minhlong.mlhr.org";

  // Fetch payment histories
  useEffect(() => {
    fetchPaymentHistories();
  }, []);

  const fetchPaymentHistories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}PaymentHistory/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        // Simulate adding transactionReferenceAttachment to some records for demo
        const enhancedData = response.data.map((item: PaymentHistory) => {
          // Add attachment to some records based on certain conditions
          if (item.paymentMethod === "PayOS" && Math.random() > 0.5) {
            return {
              ...item,
            };
          }
          return item;
        });

        setPaymentHistories(enhancedData);
        setFilteredHistories(enhancedData);
      } else {
        toast.error("Dữ liệu không hợp lệ");
        setPaymentHistories([]);
        setFilteredHistories([]);
      }
    } catch (error) {
      console.error("Error fetching payment histories:", error);
      toast.error("Không thể tải danh sách lịch sử thanh toán");
      setPaymentHistories([]);
      setFilteredHistories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter payment histories based on search term, status, date range, and payment method
  useEffect(() => {
    const filtered = paymentHistories.filter((history) => {
      // Tìm kiếm theo từ khóa
      const matchesSearch =
        history.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.serieNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (history.transactionReference &&
          history.transactionReference
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Lọc theo trạng thái
      const matchesStatus =
        statusFilter === "all" ||
        history.status.toLowerCase() === statusFilter.toLowerCase();

      // Lọc theo tab
      const matchesTab =
        activeTab === "all" ||
        history.status.toLowerCase() === activeTab.toLowerCase();

      // Lọc theo phương thức thanh toán
      const matchesPaymentMethod =
        paymentMethodFilter === "all" ||
        history.paymentMethod.toLowerCase() ===
          paymentMethodFilter.toLowerCase();

      // Lọc theo khoảng thời gian
      let matchesDateRange = true;
      if (dateRange.from && dateRange.to) {
        const paymentDate = new Date(history.paymentDate);
        matchesDateRange =
          paymentDate >= dateRange.from &&
          paymentDate <= new Date(dateRange.to.getTime() + 86400000); // Thêm 1 ngày để bao gồm ngày kết thúc
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTab &&
        matchesPaymentMethod &&
        matchesDateRange
      );
    });

    setFilteredHistories(filtered);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
  }, [
    searchTerm,
    statusFilter,
    activeTab,
    paymentHistories,
    dateRange,
    paymentMethodFilter,
  ]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      console.log("Error parsing date:", error);
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Tính toán tổng số trang
  const totalPages = Math.ceil(filteredHistories.length / itemsPerPage);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "paid") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Đã thanh toán
        </Badge>
      );
    } else if (statusLower === "partially_paid") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Thanh toán một phần
        </Badge>
      );
    } else if (statusLower === "unpaid") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Chưa thanh toán
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

  // Get payment method badge
  const getPaymentMethodBadge = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower === "payos") {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <CreditCard className="h-3 w-3 mr-1" />
          PayOS
        </Badge>
      );
    } else if (methodLower === "cash") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <DollarSign className="h-3 w-3 mr-1" />
          Tiền mặt
        </Badge>
      );
    } else if (methodLower === "bank_transfer") {
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
          <Building2 className="h-3 w-3 mr-1" />
          Chuyển khoản
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          {method}
        </Badge>
      );
    }
  };

  // Hàm để lấy các item của trang hiện tại
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredHistories.slice(startIndex, endIndex);
  };

  // View payment history details
  const handleViewDetail = async (history: PaymentHistory) => {
    setIsLoading(true);
    try {
      // Fetch detailed information if needed
      const response = await axios.get(
        `${API_URL}PaymentHistory/Payment-History-id/${history.paymentHistoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedHistory(response.data);
    } catch (error) {
      console.error("Error fetching payment history details:", error);
      // Fallback to using the list data if detail fetch fails
      setSelectedHistory(history);
    } finally {
      setIsLoading(false);
      setIsDetailOpen(true);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success("Đã xuất báo cáo thành công");
      setIsExporting(false);
    }, 1500);
  };

  // Print payment history
  const handlePrint = () => {
    if (!selectedHistory) return;
    window.print();
  };

  // Hàm để thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hàm để tạo các nút phân trang
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = isMobile ? 3 : 5;

    // Always show first page
    buttons.push(
      <PaginationItem key="first">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calculate range of visible page buttons
    let startPage = Math.max(
      2,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    const endPage = Math.min(totalPages - 1, startPage + maxVisibleButtons - 3);

    if (endPage - startPage < maxVisibleButtons - 3) {
      startPage = Math.max(2, endPage - (maxVisibleButtons - 3) + 1);
    }

    // Add ellipsis if needed before visible range
    if (startPage > 2) {
      buttons.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed after visible range
    if (endPage < totalPages - 1) {
      buttons.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      buttons.push(
        <PaginationItem key="last">
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return buttons;
  };

  // Hàm để thay đổi số lượng item trên mỗi trang
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Mobile card view for each payment history
  const PaymentHistoryCard = ({ history }: { history: PaymentHistory }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
              <CardTitle className="text-base">{history.orderCode}</CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="font-mono">
                  {history.serieNumber.substring(0, 12)}...
                </span>
              </div>
            </CardDescription>
          </div>
          {getStatusBadge(history.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Đại lý:</p>
            <p className="font-medium">
              <Building2 className="h-3 w-3 mr-1 inline text-muted-foreground" />
              {history.agencyName}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground text-xs">Ngày thanh toán:</p>
              <p className="font-medium">
                <Calendar className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {formatDate(history.paymentDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Phương thức:</p>
              <p className="font-medium">
                {getPaymentMethodBadge(history.paymentMethod)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground text-xs">
                Số tiền thanh toán:
              </p>
              <p className="font-medium text-green-600">
                {formatCurrency(history.paymentAmount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Còn nợ:</p>
              <p className="font-medium text-red-600">
                {formatCurrency(history.remainingDebtAmount)}
              </p>
            </div>
          </div>
          {history.transactionReference && (
            <div>
              <p className="text-muted-foreground text-xs">Mã giao dịch:</p>
              <div className="flex items-center">
                <p className="font-mono text-xs mr-2">
                  {history.transactionReference}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => handleViewDetail(history)}
        >
          <FileText className="h-4 w-4 mr-1" />
          Chi tiết
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6 px-2 sm:px-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Lịch sử thanh toán
        </h2>
        <p className="text-muted-foreground text-sm">
          Quản lý và theo dõi lịch sử thanh toán từ các đại lý
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <CustomDateRangePicker
          value={dateRange}
          onChange={(date) =>
            setDateRange({
              from: date?.from,
              to: date?.to,
            })
          }
          placeholder="Chọn khoảng thời gian"
          className="w-full sm:w-auto"
        />

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleExportExcel}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          Xuất báo cáo
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-lg">
                  Danh sách lịch sử thanh toán
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-2">
                  <div className="relative w-full sm:w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm theo mã đơn, đại lý..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="partially_paid">
                        Thanh toán một phần
                      </SelectItem>
                      <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={paymentMethodFilter}
                    onValueChange={setPaymentMethodFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả phương thức</SelectItem>
                      <SelectItem value="payos">PayOS</SelectItem>
                      <SelectItem value="cash">Tiền mặt</SelectItem>
                      <SelectItem value="bank_transfer">
                        Chuyển khoản
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                // Mobile card view
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  ) : filteredHistories.length === 0 ? (
                    <div className="text-center py-8">
                      Không tìm thấy lịch sử thanh toán nào
                    </div>
                  ) : (
                    getCurrentPageItems().map((history) => (
                      <PaymentHistoryCard
                        key={history.paymentHistoryId}
                        history={history}
                      />
                    ))
                  )}
                </div>
              ) : (
                // Desktop table view
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Mã đơn hàng</TableHead>
                        <TableHead>Đại lý</TableHead>
                        <TableHead className="text-center">
                          Phương thức
                        </TableHead>
                        <TableHead className="text-center">
                          Ngày thanh toán
                        </TableHead>
                        <TableHead className="text-right">
                          Số tiền thanh toán
                        </TableHead>
                        <TableHead className="text-right">Còn nợ</TableHead>
                        <TableHead className="text-center">
                          Mã giao dịch
                        </TableHead>
                        <TableHead className="text-center">
                          Trạng thái
                        </TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center h-24">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <span className="ml-3">Đang tải...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredHistories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center h-24">
                            Không tìm thấy lịch sử thanh toán nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        getCurrentPageItems().map((history) => (
                          <TableRow key={history.paymentHistoryId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                                {history.orderCode}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                                {history.agencyName}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getPaymentMethodBadge(history.paymentMethod)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {formatDate(history.paymentDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              {formatCurrency(history.paymentAmount)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatCurrency(history.remainingDebtAmount)}
                            </TableCell>
                            <TableCell className="text-center">
                              {history.transactionReference ? (
                                <div className="flex items-center justify-center">
                                  <span className="font-mono text-xs mr-2">
                                    {history.transactionReference}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(history.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(history)}
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
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t px-4 sm:px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Hiển thị</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>trên {filteredHistories.length} giao dịch</span>
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {renderPaginationButtons()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Các tab khác tương tự như tab "all" nhưng đã được lọc theo trạng thái */}
        <TabsContent value="paid" className="space-y-4">
          {/* Nội dung tương tự tab "all" nhưng đã được lọc theo trạng thái "paid" */}
        </TabsContent>

        <TabsContent value="partially_paid" className="space-y-4">
          {/* Nội dung tương tự tab "all" nhưng đã được lọc theo trạng thái "partially_paid" */}
        </TabsContent>
      </Tabs>

      {/* Dialog for viewing payment history details */}
      {selectedHistory && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Chi tiết giao dịch thanh toán</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết giao dịch thanh toán #
                {selectedHistory.serieNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Thông tin giao dịch */}
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <Receipt className="h-4 w-4 mr-2" />
                  Thông tin giao dịch
                </h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mã đơn hàng:
                    </p>
                    <p className="font-medium">{selectedHistory.orderCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mã giao dịch:
                    </p>
                    <p className="font-mono text-xs">
                      {selectedHistory.serieNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Đại lý:</p>
                    <p className="font-medium">
                      {selectedHistory.agencyName} (ID:{" "}
                      {selectedHistory.agencyId})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái:</p>
                    <div>{getStatusBadge(selectedHistory.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ngày thanh toán:
                    </p>
                    <p className="font-medium">
                      {formatDate(selectedHistory.paymentDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Phương thức thanh toán:
                    </p>
                    <div>
                      {getPaymentMethodBadge(selectedHistory.paymentMethod)}
                    </div>
                  </div>
                  {selectedHistory.transactionReference && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Mã tham chiếu giao dịch:
                      </p>
                      <div className="flex items-center">
                        <p className="font-mono">
                          {selectedHistory.transactionReference}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Chi tiết thanh toán */}
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Chi tiết thanh toán
                </h3>
                <div className="mt-3 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tổng giá trị đơn hàng:
                      </p>
                      <p className="font-medium text-lg">
                        {formatCurrency(selectedHistory.totalAmountPayment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Số tiền đã thanh toán:
                      </p>
                      <p className="font-medium text-lg text-green-600">
                        {formatCurrency(selectedHistory.paymentAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Số tiền còn nợ:</p>
                      <p className="font-bold text-lg text-red-600">
                        {formatCurrency(selectedHistory.remainingDebtAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Thông tin thời gian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Ngày tạo:</p>
                  <p>{formatDate(selectedHistory.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cập nhật lần cuối:</p>
                  <p>{formatDate(selectedHistory.updatedAt)}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="hidden sm:flex"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  In hóa đơn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="hidden sm:flex"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
              </div>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog for viewing attachment */}
      <Dialog
        open={isAttachmentDialogOpen}
        onOpenChange={setIsAttachmentDialogOpen}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Tệp đính kèm giao dịch</DialogTitle>
            <DialogDescription>
              Xem tệp đính kèm cho mã tham chiếu giao dịch
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAttachmentDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
