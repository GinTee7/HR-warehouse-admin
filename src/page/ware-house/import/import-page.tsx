"use client";

import { useState, useEffect, forwardRef } from "react";
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
  Filter,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ImportForm } from "./component/import-form";
import { ImportDetail } from "./component/import-detail";
import { useMediaQuery } from "@/components/hooks/use-media-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

// Updated interface to match the new data structure
interface ImportReceipt {
  warehouseReceiptId: number;
  documentNumber: string;
  documentDate: string;
  warehouseId: number;
  warehouseName: string;
  importType: string;
  supplier: string;
  dateImport: string;
  totalQuantity: number;
  totalPrice: number;
  batches: any[];
  isApproved: boolean;
}

// Move this outside the ImportPage component
const ImportCard = forwardRef<
  HTMLDivElement,
  { imp: ImportReceipt; onViewDetail: (imp: ImportReceipt) => void }
>(({ imp, onViewDetail }, ref) => (
  <Card className="mb-4" ref={ref}>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-base">{imp.documentNumber}</CardTitle>
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            imp.isApproved
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {imp.isApproved ? "Hoàn thành" : "Đang kiểm tra"}
        </div>
      </div>
      <CardDescription className="text-sm">
        Ngày: {new Date(imp.documentDate).toLocaleDateString()}
      </CardDescription>
    </CardHeader>
    <CardContent className="pb-2 pt-0">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground">Nhà cung cấp:</p>
          <p className="font-medium">{imp.supplier}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Kho nhập:</p>
          <p className="font-medium">{imp.warehouseName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Giá trị:</p>
          <p className="font-medium">{imp.totalPrice.toLocaleString()} đ</p>
        </div>
        <div>
          <p className="text-muted-foreground">Số lượng:</p>
          <p className="font-medium">{imp.totalQuantity}</p>
        </div>
      </div>
    </CardContent>
    <CardFooter className="pt-2">
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => onViewDetail(imp)}
      >
        <FileText className="h-4 w-4 mr-1" />
        Chi tiết
      </Button>
    </CardFooter>
  </Card>
));

// Add display name
ImportCard.displayName = "ImportCard";

export default function ImportPage() {
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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedImport, setSelectedImport] = useState<ImportReceipt | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [imports, setImports] = useState<ImportReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Fetch imports
  const fetchImports = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}warehouse-receipts/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if the response has the success and data structure
      const responseData = response.data.success
        ? response.data.data
        : response.data;

      // Use the data directly as it matches our interface
      setImports(Array.isArray(responseData) ? responseData : []);
    } catch (error) {
      console.error("Error fetching imports:", error);
      toast.error("Không thể tải danh sách phiếu nhập");
      setImports([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchImports();
  }, [isImportDialogOpen]); // Refetch when dialog closes

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchImports();
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Filter imports based on search term and status
  const filteredImports = imports.filter((imp) => {
    const matchesSearch =
      imp.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || imp.isApproved?.toString() === statusFilter;

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "completed" && imp.isApproved === true) ||
      (activeTab === "processing" && imp.isApproved === false);

    return matchesSearch && matchesStatus && matchesTab;
  });
  const totalPages = Math.ceil(filteredImports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedImports = filteredImports.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const handleViewDetail = (importItem: ImportReceipt) => {
    setSelectedImport(importItem);
    setIsDetailOpen(true);
  };

  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
  };

  // Print import receipt
  const handlePrint = () => {
    if (!selectedImport) return;
    window.print();
  };

  return (
    <div className="space-y-6 px-2 sm:px-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Nhập sản phẩm vào kho
          </h2>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-current"></div>
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Làm mới
          </Button>

          <Dialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo phiếu nhập
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px]">
              <DialogHeader>
                <DialogTitle>Tạo phiếu nhập sản phẩm</DialogTitle>
                <DialogDescription>
                  Điền thông tin để tạo phiếu nhập sản phẩm mới
                </DialogDescription>
              </DialogHeader>
              <ImportForm onClose={handleCloseImportDialog} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">Tất cả phiếu nhập</TabsTrigger>
            <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
            <TabsTrigger value="processing">Đang kiểm tra</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách phiếu nhập</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm theo mã phiếu, nhà cung cấp..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="true">Đã hoàn thành</SelectItem>
                      <SelectItem value="false">Đang kiểm tra</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Số dòng / trang */}
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
              </div>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                // Mobile card view
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  ) : filteredImports.length === 0 ? (
                    <div className="text-center py-8">
                      Không tìm thấy phiếu nhập nào
                    </div>
                  ) : (
                    filteredImports.map((imp) => (
                      <ImportCard
                        key={imp.warehouseReceiptId}
                        imp={imp}
                        onViewDetail={handleViewDetail}
                      />
                    ))
                  )}
                </div>
              ) : (
                // Desktop table view
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã phiếu</TableHead>
                        <TableHead>Ngày nhập</TableHead>
                        <TableHead>Nhà cung cấp</TableHead>
                        <TableHead>Kho nhập</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                              <span className="ml-3">Đang tải...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : paginatedImports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            Không tìm thấy phiếu nhập nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedImports.map((imp) => (
                          <TableRow key={imp.warehouseReceiptId}>
                            <TableCell className="font-medium">
                              {imp.documentNumber}
                            </TableCell>
                            <TableCell>
                              {new Date(imp.dateImport).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{imp.supplier}</TableCell>
                            <TableCell>{imp.warehouseName}</TableCell>
                            <TableCell>
                              <div
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  imp.isApproved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {imp.isApproved
                                  ? "Hoàn thành"
                                  : "Đang kiểm tra"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {imp.totalPrice.toLocaleString()} đ
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(imp)}
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
            <CardFooter className="flex justify-between items-center border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {paginatedImports.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, filteredImports.length)} /{" "}
                {filteredImports.length} phiếu nhập
              </div>
              <div className="flex items-center gap-2">
                {/* Pagination */}
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
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
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Phiếu nhập đã hoàn thành
              </CardTitle>
              <CardDescription className="text-sm">
                Danh sách các phiếu nhập đã hoàn thành kiểm tra chất lượng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                // Mobile card view
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  ) : filteredImports.length === 0 ? (
                    <div className="text-center py-8">
                      Không tìm thấy phiếu nhập nào đã hoàn thành
                    </div>
                  ) : (
                    filteredImports.map((imp) => (
                      <ImportCard
                        key={imp.warehouseReceiptId}
                        imp={imp}
                        onViewDetail={handleViewDetail}
                      />
                    ))
                  )}
                </div>
              ) : (
                // Desktop table view
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã phiếu</TableHead>
                        <TableHead>Ngày nhập</TableHead>
                        <TableHead>Nhà cung cấp</TableHead>
                        <TableHead>Kho nhập</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                              <span className="ml-3">Đang tải...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredImports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            Không tìm thấy phiếu nhập nào đã hoàn thành
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredImports.map((imp) => (
                          <TableRow key={imp.warehouseReceiptId}>
                            <TableCell className="font-medium">
                              {imp.documentNumber}
                            </TableCell>
                            <TableCell>
                              {new Date(imp.documentDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{imp.supplier}</TableCell>
                            <TableCell>{imp.warehouseName}</TableCell>
                            <TableCell>
                              <div
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  imp.isApproved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {imp.isApproved
                                  ? "Hoàn thành"
                                  : "Đang kiểm tra"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {imp.totalPrice.toLocaleString()} đ
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(imp)}
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
                  <CardFooter className="flex justify-between items-center border-t px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                      Hiển thị{" "}
                      {filteredImports.length === 0 ? 0 : indexOfFirstItem + 1}{" "}
                      - {Math.min(indexOfLastItem, filteredImports.length)} /{" "}
                      {filteredImports.length} phiếu nhập
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Chọn số dòng/trang */}
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
                      {/* Pagination */}
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
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
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
                  </CardFooter>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Phiếu nhập đang kiểm tra
              </CardTitle>
              <CardDescription className="text-sm">
                Danh sách các phiếu nhập đang trong quá trình kiểm tra chất
                lượng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                // Mobile card view
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  ) : filteredImports.length === 0 ? (
                    <div className="text-center py-8">
                      Không tìm thấy phiếu nhập nào đang kiểm tra
                    </div>
                  ) : (
                    filteredImports.map((imp) => (
                      <ImportCard
                        key={imp.warehouseReceiptId}
                        imp={imp}
                        onViewDetail={handleViewDetail}
                      />
                    ))
                  )}
                </div>
              ) : (
                // Desktop table view
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã phiếu</TableHead>
                        <TableHead>Ngày nhập</TableHead>
                        <TableHead>Nhà cung cấp</TableHead>
                        <TableHead>Kho nhập</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                              <span className="ml-3">Đang tải...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredImports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            Không tìm thấy phiếu nhập nào đang kiểm tra
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredImports.map((imp) => (
                          <TableRow key={imp.warehouseReceiptId}>
                            <TableCell className="font-medium">
                              {imp.documentNumber}
                            </TableCell>
                            <TableCell>
                              {new Date(imp.documentDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{imp.supplier}</TableCell>
                            <TableCell>{imp.warehouseName}</TableCell>
                            <TableCell>
                              <div
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  imp.isApproved
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {imp.isApproved
                                  ? "Hoàn thành"
                                  : "Đang kiểm tra"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {imp.totalPrice.toLocaleString()} đ
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(imp)}
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
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu nhập</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết phiếu nhập {selectedImport?.documentNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedImport && <ImportDetail importData={selectedImport} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              In phiếu nhập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
