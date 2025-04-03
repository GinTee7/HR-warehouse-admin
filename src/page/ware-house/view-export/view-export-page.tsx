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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  Loader2,
  Package,
  Calendar,
  Filter,
  ClipboardList,
  FileOutput,
  Building,
  User,
  RefreshCcw,
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
import { useMediaQuery } from "@/components/hooks/use-media-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Import SignalR connection để lắng nghe sự kiện realtime
import { connection } from "@/lib/signalr-client";

// ------------------
// Các interface
// ------------------
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

interface RequestExportDetail {
  requestExportDetailId: number;
  productId: number;
  requestedQuantity: number;
  productDetail?: ProductDetail;
}

interface RequestExport {
  requestExportCode: string;
  requestExportId: number;
  orderId: string;
  requestedBy: number;
  approvedBy: number;
  status: string;
  approvedDate: string;
  note: string;
  requestExportDetails: RequestExportDetail[];
  agencyName: string;
  approvedByName: string;
}

export default function ViewExportPage() {
  const [exportRequests, setExportRequests] = useState<RequestExport[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestExport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestExport | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [productCache, setProductCache] = useState<Map<number, ProductDetail>>(
    new Map()
  );
  const [isCreatingExport, setIsCreatingExport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const token = sessionStorage.getItem("token");
  const warehouseId = sessionStorage.getItem("warehouseId") || "3";
  const API_URL = import.meta.env.VITE_API_URL || "https://minhlong.mlhr.org";

  // ------------------
  // Fetch export requests
  // ------------------
  const fetchExportRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}RequestExport/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setExportRequests(response.data);

        // Tập hợp tất cả productId từ các yêu cầu
        const productIds = new Set<number>();
        response.data.forEach((request: RequestExport) => {
          request.requestExportDetails.forEach(
            (detail: RequestExportDetail) => {
              productIds.add(detail.productId);
            }
          );
        });

        // Fetch thông tin sản phẩm cho các productId đó
        await fetchProductDetails(Array.from(productIds));
      } else {
        toast.error("Dữ liệu không hợp lệ");
        setExportRequests([]);
        setFilteredRequests([]);
      }
    } catch (error) {
      console.error("Error fetching export requests:", error);
      toast.error("Không thể tải danh sách yêu cầu xuất kho");
      setExportRequests([]);
      setFilteredRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------
  // Fetch product details
  // ------------------
  const fetchProductDetails = async (productIds: number[]) => {
    const newProductCache = new Map(productCache);
    const idsToFetch = productIds.filter((id) => !newProductCache.has(id));

    if (idsToFetch.length === 0) return;

    try {
      const promises = idsToFetch.map(async (productId) => {
        try {
          const response = await axios.get(`${API_URL}product/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return { id: productId, data: response.data };
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return { id: productId, data: null };
        }
      });

      const results = await Promise.all(promises);
      results.forEach((result) => {
        if (result.data) {
          newProductCache.set(result.id, result.data);
        }
      });
      setProductCache(newProductCache);

      // Cập nhật thông tin sản phẩm vào yêu cầu xuất
      setExportRequests((prevRequests) =>
        prevRequests.map((request) => ({
          ...request,
          requestExportDetails: request.requestExportDetails.map((detail) => ({
            ...detail,
            productDetail: newProductCache.get(detail.productId),
          })),
        }))
      );
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  // Gọi fetch một lần khi component mount
  useEffect(() => {
    fetchExportRequests();
  }, []);

  // ------------------
  // Auto refresh khi nhận được sự kiện từ SIGNALR
  // ------------------
  useEffect(() => {
    const handleNewExportRequest = () => {
      fetchExportRequests();
    };

    connection.on("ReceiveNotification", handleNewExportRequest);
    return () => {
      connection.off("ReceiveNotification", handleNewExportRequest);
    };
  }, []);

  // ------------------
  // Filter and paginate export requests
  // ------------------
  useEffect(() => {
    const filtered = exportRequests.filter((req) => {
      const matchesSearch =
        req.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestExportId.toString().includes(searchTerm) ||
        req.requestExportDetails.some(
          (detail) =>
            detail.productDetail?.productName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            detail.productDetail?.productCode
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" ||
        req.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesTab =
        activeTab === "all" ||
        req.status.toLowerCase() === activeTab.toLowerCase();

      return matchesSearch && matchesStatus && matchesTab;
    });

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedRequests = filtered.slice(indexOfFirstItem, indexOfLastItem);

    setFilteredRequests(paginatedRequests);
  }, [
    searchTerm,
    statusFilter,
    activeTab,
    exportRequests,
    productCache,
    currentPage,
    itemsPerPage,
  ]);

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
    } else if (statusLower === "requested") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Đang yêu cầu
        </Badge>
      );
    } else if (statusLower === "cancelled") {
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

  const getTotalQuantity = (request: RequestExport) => {
    return request.requestExportDetails.reduce(
      (sum, detail) => sum + detail.requestedQuantity,
      0
    );
  };

  const handleViewDetail = (request: RequestExport) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  const getProductNames = (request: RequestExport) => {
    return request.requestExportDetails
      .map((detail) => {
        const productName =
          detail.productDetail?.productName || `Sản phẩm ${detail.productId}`;
        return `${productName} (${detail.requestedQuantity})`;
      })
      .join(", ");
  };

  const handleCreateExport = async () => {
    if (!selectedRequest) return;

    setIsCreatingExport(true);
    try {
      const response = await axios.post(
        `${API_URL}export-receipts/create-from-request`,
        null,
        {
          params: {
            requestExportId: selectedRequest.requestExportId,
            warehouseId: warehouseId,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Đã tạo phiếu xuất kho thành công");
        setExportRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.requestExportId === selectedRequest.requestExportId
              ? { ...req, status: "PROCESSING" }
              : req
          )
        );
        setIsDetailOpen(false);
      } else {
        throw new Error("Không thể tạo phiếu xuất kho");
      }
    } catch (error) {
      console.error("Error creating export:", error);
      toast.error("Không thể tạo phiếu xuất kho. Vui lòng thử lại sau.");
    } finally {
      setIsCreatingExport(false);
    }
  };

  // ------------------
  // Component hiển thị theo dạng card trên mobile
  // ------------------
  const RequestCard = ({ request }: { request: RequestExport }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
              <CardTitle className="text-base">
                YC #{request.requestExportId}
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              <div className="flex items-center">
                <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="font-mono">
                  {request.requestExportCode}...
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
              <p className="text-muted-foreground text-xs">Ngày duyệt:</p>
              <p className="font-medium">
                <Calendar className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {formatDate(request.approvedDate)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Số lượng:</p>
              <p className="font-medium">
                <Package className="h-3 w-3 mr-1 inline text-muted-foreground" />
                {getTotalQuantity(request).toLocaleString()}
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
          onClick={() => handleViewDetail(request)}
        >
          <FileText className="h-4 w-4 mr-1" />
          Chi tiết
        </Button>
      </CardFooter>
    </Card>
  );

  const getTotalValue = (request: RequestExport) => {
    return request.requestExportDetails.reduce((sum, detail) => {
      const product = productCache.get(detail.productId);
      const price = product?.price || 0;
      return sum + price * detail.requestedQuantity;
    }, 0);
  };

  return (
    <div className="space-y-6 px-2 sm:px-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Yêu cầu xuất kho
        </h2>
        <p className="text-muted-foreground text-sm">
          Xem danh sách các yêu cầu xuất kho từ đại lý
        </p>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="requested">Đang xử lý</TabsTrigger>
          <TabsTrigger value="approved">Hoàn thành</TabsTrigger>
          <TabsTrigger value="cancelled">Đang yêu cầu</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-lg">
                  Danh sách yêu cầu xuất kho
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-2">
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                      <SelectItem value="approved">Hoàn thành</SelectItem>
                      <SelectItem value="requested">Đang yêu cầu</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
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
                  <Button variant="outline" onClick={fetchExportRequests}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Làm mới
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-8">
                      Không tìm thấy yêu cầu xuất kho nào
                    </div>
                  ) : (
                    filteredRequests.map((request) => (
                      <RequestCard
                        key={request.requestExportId}
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
                        <TableHead className="w-[80px]">Mã YC</TableHead>
                        <TableHead className="w-[180px]">Mã đơn hàng</TableHead>
                        <TableHead className="w-[180px]">Tên đại lý</TableHead>
                        <TableHead className="w-[180px]">
                          Người duyệt xuất kho
                        </TableHead>
                        {!isTablet && <TableHead>Sản phẩm</TableHead>}
                        <TableHead className="text-center">
                          Ngày duyệt
                        </TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-center">
                          Trạng thái
                        </TableHead>
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
                      ) : filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={isTablet ? 8 : 9}
                            className="text-center h-24"
                          >
                            Không tìm thấy yêu cầu xuất kho nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request) => (
                          <TableRow key={request.requestExportId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                                {request.requestExportId}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-xs font-mono">
                                  {request.requestExportCode}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-2 text-gray-500" />
                                {request.agencyName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                {request.approvedByName}
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
                              <div className="flex items-center justify-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                {formatDate(request.approvedDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                                {getTotalQuantity(request).toLocaleString()}
                              </div>
                            </TableCell>
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
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t px-4 sm:px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, exportRequests.length)} /{" "}
                {exportRequests.length} yêu cầu
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
                    { length: Math.ceil(exportRequests.length / itemsPerPage) },
                    (_, i) => i + 1
                  )
                    .slice(
                      Math.max(0, currentPage - 3),
                      Math.min(
                        Math.ceil(exportRequests.length / itemsPerPage),
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
                    Math.ceil(exportRequests.length / itemsPerPage) - 2 && (
                    <>
                      <PaginationItem>
                        <span>...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() =>
                            setCurrentPage(
                              Math.ceil(exportRequests.length / itemsPerPage)
                            )
                          }
                          className="cursor-pointer"
                        >
                          {Math.ceil(exportRequests.length / itemsPerPage)}
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
                            Math.ceil(exportRequests.length / itemsPerPage)
                          )
                        )
                      }
                      className={
                        currentPage ===
                        Math.ceil(exportRequests.length / itemsPerPage)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Các Tabs khác tương tự */}
        <TabsContent value="processing" className="space-y-4">
          {/* ... */}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">
          {/* ... */}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-4">
          {/* ... */}
        </TabsContent>
      </Tabs>

      {selectedRequest && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[1000px]">
            <DialogHeader>
              <DialogTitle>Chi tiết yêu cầu xuất kho</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết yêu cầu xuất kho #
                {selectedRequest.requestExportId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Thông tin yêu cầu
                </h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mã yêu cầu:</p>
                    <p className="font-medium">
                      {selectedRequest.requestExportId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mã đơn hàng:
                    </p>
                    <p className="font-mono text-xs">
                      {selectedRequest.requestExportCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày duyệt:</p>
                    <p className="font-medium">
                      {formatDate(selectedRequest.approvedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trạng thái:</p>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng số lượng:
                    </p>
                    <p className="font-medium">
                      {getTotalQuantity(selectedRequest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Tổng giá trị:
                    </p>
                    <p className="font-medium">
                      {getTotalValue(selectedRequest).toLocaleString()} đ
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Ghi chú:</p>
                    <p className="font-medium">
                      {selectedRequest.note || "Order approved and exported"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Chi tiết sản phẩm
                </h3>
                <div className="mt-3 rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Mã SP</TableHead>
                        <TableHead>Tên sản phẩm</TableHead>
                        <TableHead className="text-center">Đơn vị</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequest.requestExportDetails.map((detail) => {
                        const product = productCache.get(detail.productId);
                        const price = product?.price || 0;
                        const total = price * detail.requestedQuantity;

                        return (
                          <TableRow key={detail.requestExportDetailId}>
                            <TableCell className="font-medium">
                              SP{String(detail.productId).padStart(3, "0")}
                            </TableCell>
                            <TableCell>
                              {product?.productName ||
                                `Sản phẩm ${detail.productId}`}
                            </TableCell>
                            <TableCell className="text-center">
                              {product?.unit || "Cái"}
                            </TableCell>
                            <TableCell className="text-center">
                              {detail.requestedQuantity}
                            </TableCell>
                            <TableCell className="text-right">
                              {price.toLocaleString()} đ
                            </TableCell>
                            <TableCell className="text-right">
                              {total.toLocaleString()} đ
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end mt-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Tổng giá trị:{" "}
                      {getTotalValue(selectedRequest).toLocaleString()} VNĐ
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center">
              <div>
                {selectedRequest.status.toLowerCase() === "requested" && (
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleCreateExport}
                    disabled={isCreatingExport}
                  >
                    {isCreatingExport ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FileOutput className="h-4 w-4 mr-2" />
                        Làm đơn xuất kho
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
