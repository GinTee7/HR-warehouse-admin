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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  FileText,
  Printer,
  Download,
  Filter,
  Loader2,
  Package,
  Calendar,
  Building,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ExportDetail } from "./component/export-detail";
import { ExportForm } from "./component/export-form";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Interfaces remain the same
interface ExportReceipt {
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
  details: ExportReceiptDetail[];
  exportWarehouseReceiptId: number;
}

interface ExportReceiptDetail {
  warehouseProductId: number;
  productId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalProductAmount: number;
  expiryDate: string;
  exportWarehouseReceiptId?: number; // Make it optional in the main page
}

export default function ExportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedExport, setSelectedExport] = useState<ExportReceipt | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [exports, setExports] = useState<ExportReceipt[]>([]);
  const [isExportFormOpen, setIsExportFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch export data
  useEffect(() => {
    fetchExports();
  }, [refreshTrigger]);

  const fetchExports = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}WarehouseExport/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        setExports(response.data.data);
      } else {
        toast.warning("Không thể lấy dữ liệu từ API, đang sử dụng dữ liệu mẫu");
      }
    } catch (error) {
      console.error("Error fetching exports:", error);
    } finally {
      setIsLoading(false);
    }
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

  // Get status badge with improved styling
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed" || statusLower === "approved") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
          Hoàn thành
        </Badge>
      );
    } else if (statusLower === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors">
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          Đang xử lý
        </Badge>
      );
    } else if (statusLower === "cancelled" || statusLower === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 transition-colors">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Đã hủy
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
          {status}
        </Badge>
      );
    }
  };

  // Filter and paginate exports based on search term, status, and active tab
  const filteredExports = exports.filter((exp) => {
    const matchesSearch =
      exp.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.orderCode.toString().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" &&
        (exp.status.toLowerCase() === "completed" ||
          exp.status.toLowerCase() === "approved")) ||
      (statusFilter === "pending" && exp.status.toLowerCase() === "pending");

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "completed" &&
        (exp.status.toLowerCase() === "completed" ||
          exp.status.toLowerCase() === "approved")) ||
      (activeTab === "pending" && exp.status.toLowerCase() === "pending");

    return matchesSearch && matchesStatus && matchesTab;
  });

  const paginatedExports = filteredExports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetail = (exportItem: ExportReceipt) => {
    setSelectedExport(exportItem);
    setIsDetailOpen(true);
  };

  const handleCreateExport = () => {
    setIsExportFormOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleExportApproved = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Reusable Table Component to avoid repetition
  const ExportTable = ({ data }: { data: ExportReceipt[] }) => (
    <div className="rounded-lg border shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[120px] font-semibold">Mã phiếu</TableHead>
            <TableHead className="w-[120px] font-semibold">Ngày xuất</TableHead>
            <TableHead className="font-semibold">Đại lý</TableHead>
            <TableHead className="text-center font-semibold">
              Mã đơn hàng
            </TableHead>
            <TableHead className="text-center font-semibold">
              Số lượng
            </TableHead>
            <TableHead className="text-center font-semibold">Giá trị</TableHead>
            {activeTab === "all" && (
              <TableHead className="text-center font-semibold">
                Trạng thái
              </TableHead>
            )}
            <TableHead className="text-right font-semibold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={activeTab === "all" ? 8 : 7}
                className="text-center h-24"
              >
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3">Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={activeTab === "all" ? 8 : 7}
                className="text-center h-24 text-gray-500"
              >
                Không tìm thấy phiếu xuất nào
              </TableCell>
            </TableRow>
          ) : (
            data.map((exp) => (
              <TableRow
                key={exp.documentNumber}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    {exp.documentNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDate(exp.exportDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    {exp.agencyName}
                  </div>
                </TableCell>
                <TableCell className="text-center">{exp.orderCode}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Package className="h-4 w-4 mr-2 text-gray-500" />
                    {exp.totalQuantity.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {exp.totalAmount.toLocaleString()} đ
                </TableCell>
                {activeTab === "all" && (
                  <TableCell className="text-center">
                    {getStatusBadge(exp.status)}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetail(exp)}
                    className="hover:text-blue-600 transition-colors"
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
  );

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Xuất sản phẩm ra kho
          </h2>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Dialog open={isExportFormOpen} onOpenChange={setIsExportFormOpen}>
            <DialogTrigger asChild>
              <Button className="transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                Tạo phiếu xuất
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px]">
              <DialogHeader>
                <DialogTitle>Tạo phiếu xuất sản phẩm</DialogTitle>
                <DialogDescription>
                  Điền thông tin để tạo phiếu xuất sản phẩm mới
                </DialogDescription>
              </DialogHeader>
              <ExportForm onClose={handleCreateExport} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs and Filters */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="overflow-x-auto whitespace-nowrap bg-white shadow-sm rounded-lg p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-md transition-colors"
          >
            Tất cả phiếu xuất
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-md transition-colors"
          >
            Đã hoàn thành
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-md transition-colors"
          >
            Đang xử lý
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <Card className="shadow-md border-0">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <CardTitle className="text-xl font-semibold">
                    {activeTab === "all"
                      ? "Danh sách phiếu xuất"
                      : activeTab === "completed"
                      ? "Phiếu xuất đã hoàn thành"
                      : "Phiếu xuất đang xử lý"}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredExports.length
                    )}{" "}
                    / {filteredExports.length} phiếu xuất
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Tìm theo mã phiếu, đại lý..."
                      className="pl-8 border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] border-gray-300">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="completed">Đã hoàn thành</SelectItem>
                      <SelectItem value="pending">Đang xử lý</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number.parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[100px] border-gray-300">
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
            </CardHeader>
            <CardContent>
              <ExportTable data={paginatedExports} />
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4 bg-gray-50">
              <div className="text-sm text-gray-600">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredExports.length)} /{" "}
                {filteredExports.length} phiếu xuất
              </div>
              <div className="flex items-center gap-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    In danh sách
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-100 transition-colors"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Xuất Excel
                  </Button>
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
                      {
                        length: Math.ceil(
                          filteredExports.length / itemsPerPage
                        ),
                      },
                      (_, i) => i + 1
                    )
                      .slice(
                        Math.max(0, currentPage - 3),
                        Math.min(
                          Math.ceil(filteredExports.length / itemsPerPage),
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
                      Math.ceil(filteredExports.length / itemsPerPage) - 2 && (
                      <>
                        <PaginationItem>
                          <span>...</span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() =>
                              setCurrentPage(
                                Math.ceil(filteredExports.length / itemsPerPage)
                              )
                            }
                            className="cursor-pointer"
                          >
                            {Math.ceil(filteredExports.length / itemsPerPage)}
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
                              Math.ceil(filteredExports.length / itemsPerPage)
                            )
                          )
                        }
                        className={
                          currentPage ===
                          Math.ceil(filteredExports.length / itemsPerPage)
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-full max-w-3xl sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu xuất</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết phiếu xuất {selectedExport?.documentNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedExport && (
            <ExportDetail
              exportData={selectedExport}
              onApproved={handleExportApproved}
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailOpen(false)}
              className="border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Đóng
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
              <Printer className="mr-2 h-4 w-4" />
              In phiếu xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
