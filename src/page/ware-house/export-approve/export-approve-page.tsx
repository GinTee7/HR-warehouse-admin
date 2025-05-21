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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  FileText,
  Loader2,
  Package,
  CheckCircle,
  Filter,
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
import { ApproveExportDialog } from "./component/approve-export-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ExportRequestDetailDialog } from "./component/export-request-detail-dialog";

// Interface cho dữ liệu yêu cầu xuất kho
interface ExportRequest {
  warehouseRequestExportId: number;
  requestExportId: number;
  productId: number;
  productName: string;
  quantityRequested: number;
  remainingQuantity: number;
  dateRequested: string;
  status: string;
  agencyName: string;
  orderCode?: number;
}

// Interface cho dữ liệu phê duyệt
interface ApprovalData {
  warehouseRequestExportId: number;
  quantityApproved: number;
  requestExportId: number;
  productId: number;
  approvedBy: string;
}

export default function ExportApprovalPage() {
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ExportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<ExportRequest | null>(
    null
  );
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);

  const token = localStorage.getItem("token");
  const warehouseId = localStorage.getItem("warehouseId") || "3";
  const userId =
    localStorage.getItem("userId") || "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  const API_URL = import.meta.env.VITE_API_URL || "https://minhlong.mlhr.org";

  // Fetch export requests
  useEffect(() => {
    fetchExportRequests();
  }, []);

  const fetchExportRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}WarehouseRequestExport/warehouse/${warehouseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        const formattedData: ExportRequest[] = response.data.map(
          (item: any) => ({
            warehouseRequestExportId: item.warehouseRequestExportId,
            requestExportId: item.requestExportId,
            productId: item.productId,
            productName: item.productName || "Chưa rõ sản phẩm",
            quantityRequested: item.quantityRequested,
            remainingQuantity: item.remainingQuantity,
            dateRequested: item.dateRequested || new Date().toISOString(),
            status: item.status || "pending",
            agencyName: item.agencyName || "Chưa rõ đại lý",
            orderCode: item.orderCode || undefined,
          })
        );

        // Sort requests so that pending requests appear first
        formattedData.sort((a, b) => {
          if (
            a.status.toLowerCase() === "pending" &&
            b.status.toLowerCase() !== "pending"
          ) {
            return -1;
          }
          if (
            a.status.toLowerCase() !== "pending" &&
            b.status.toLowerCase() === "pending"
          ) {
            return 1;
          }
          return 0;
        });

        setExportRequests(formattedData);
      } else {
        toast.error("Dữ liệu không hợp lệ");
        setExportRequests([]);
        setFilteredRequests([]);
      }
    } catch (error) {
      console.error("Error fetching export requests:", error);
      setExportRequests([]);
      setFilteredRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and paginate export requests
  useEffect(() => {
    const filtered = exportRequests.filter((req) => {
      const matchesSearch =
        req.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.orderCode?.toString() || "").includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" &&
          req.status.toLowerCase() === "pending") ||
        (statusFilter === "approved" &&
          req.status.toLowerCase() === "approved") ||
        (statusFilter === "rejected" &&
          req.status.toLowerCase() === "rejected");

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "pending" && req.status.toLowerCase() === "pending") ||
        (activeTab === "approved" && req.status.toLowerCase() === "approved") ||
        (activeTab === "rejected" && req.status.toLowerCase() === "rejected");

      return matchesSearch && matchesStatus && matchesTab;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedRequests = filtered.slice(indexOfFirstItem, indexOfLastItem);

    setFilteredRequests(paginatedRequests);
  }, [
    searchTerm,
    statusFilter,
    activeTab,
    exportRequests,
    currentPage,
    itemsPerPage,
  ]);

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
    } else if (statusLower === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Chờ duyệt
        </Badge>
      );
    } else if (statusLower === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          Từ chối
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          {status}
        </Badge>
      );
    }
  };

  // Handle approve request
  const handleApproveRequest = (request: ExportRequest) => {
    setSelectedRequest(request);
    setIsApproveDialogOpen(true);
  };

  const handleViewDetails = (warehouseRequestExportId: number) => {
    setSelectedDetailId(warehouseRequestExportId);
    setIsDetailDialogOpen(true);
  };

  // Submit approval
  const handleSubmitApproval = async (approvalData: ApprovalData) => {
    try {
      const response = await axios.post(
        `${API_URL}WarehouseRequestExport/approve`,
        approvalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 204
      ) {
        toast.success("Duyệt yêu cầu xuất kho thành công");
        fetchExportRequests();
        setIsApproveDialogOpen(false);
      } else {
        throw new Error("Không thể duyệt yêu cầu xuất kho");
      }
    } catch (error) {
      console.error("Error approving export request:", error);
      toast.error("Không thể duyệt yêu cầu xuất kho. Vui lòng thử lại sau.");
    }
  };

  // Reusable Table Component
  const ExportRequestTable = ({
    data,
    showStatus = true,
  }: {
    data: ExportRequest[];
    showStatus?: boolean;
  }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Mã YC</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Đại lý</TableHead>
            <TableHead className="text-center">Ngày yêu cầu</TableHead>
            <TableHead className="text-center">SL yêu cầu</TableHead>
            <TableHead className="text-center">SL còn lại</TableHead>
            {showStatus && (
              <TableHead className="text-center">Trạng thái</TableHead>
            )}
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={showStatus ? 8 : 7}
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
                colSpan={showStatus ? 8 : 7}
                className="text-center h-24"
              >
                Không tìm thấy yêu cầu xuất kho nào
              </TableCell>
            </TableRow>
          ) : (
            data.map((request) => (
              <TableRow key={request.warehouseRequestExportId}>
                <TableCell className="font-medium">
                  {request.requestExportId}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{request.productName}</span>
                    <span className="text-xs text-muted-foreground">
                      Mã SP: {request.productId}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{request.agencyName}</TableCell>
                <TableCell className="text-center">
                  {formatDate(request.dateRequested)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                    {request.quantityRequested.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                    {request.remainingQuantity.toLocaleString()}
                  </div>
                </TableCell>
                {showStatus && (
                  <TableCell className="text-center">
                    {getStatusBadge(request.status)}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleViewDetails(request.warehouseRequestExportId)
                      }
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Chi tiết
                    </Button>

                    {request.status.toLowerCase() === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleApproveRequest(request)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Duyệt
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Duyệt đơn xuất kho
        </h2>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="all">Tất cả yêu cầu</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
          <TabsTrigger value="rejected">Từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center flex-col sm:flex-row gap-3">
                <div>
                  <CardTitle>Danh sách yêu cầu xuất kho</CardTitle>
                  <CardDescription>
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      exportRequests.length
                    )}{" "}
                    / {exportRequests.length} yêu cầu
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm theo tên sản phẩm, đại lý..."
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
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
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
            </CardHeader>
            <CardContent>
              <ExportRequestTable data={filteredRequests} />
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
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

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu chờ duyệt</CardTitle>
              <CardDescription>
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "pending"
                  ).length
                )}{" "}
                /{" "}
                {
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "pending"
                  ).length
                }{" "}
                yêu cầu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportRequestTable
                data={filteredRequests.filter(
                  (req) => req.status.toLowerCase() === "pending"
                )}
                showStatus={false}
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "pending"
                  ).length
                )}{" "}
                /{" "}
                {
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "pending"
                  ).length
                }{" "}
                yêu cầu
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
                        exportRequests.filter(
                          (req) => req.status.toLowerCase() === "pending"
                        ).length / itemsPerPage
                      ),
                    },
                    (_, i) => i + 1
                  )
                    .slice(
                      Math.max(0, currentPage - 3),
                      Math.min(
                        Math.ceil(
                          exportRequests.filter(
                            (req) => req.status.toLowerCase() === "pending"
                          ).length / itemsPerPage
                        ),
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
                    Math.ceil(
                      exportRequests.filter(
                        (req) => req.status.toLowerCase() === "pending"
                      ).length / itemsPerPage
                    ) -
                      2 && (
                    <>
                      <PaginationItem>
                        <span>...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() =>
                            setCurrentPage(
                              Math.ceil(
                                exportRequests.filter(
                                  (req) =>
                                    req.status.toLowerCase() === "pending"
                                ).length / itemsPerPage
                              )
                            )
                          }
                          className="cursor-pointer"
                        >
                          {Math.ceil(
                            exportRequests.filter(
                              (req) => req.status.toLowerCase() === "pending"
                            ).length / itemsPerPage
                          )}
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
                            Math.ceil(
                              exportRequests.filter(
                                (req) => req.status.toLowerCase() === "pending"
                              ).length / itemsPerPage
                            )
                          )
                        )
                      }
                      className={
                        currentPage ===
                        Math.ceil(
                          exportRequests.filter(
                            (req) => req.status.toLowerCase() === "pending"
                          ).length / itemsPerPage
                        )
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

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu đã duyệt</CardTitle>
              <CardDescription>
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "approved"
                  ).length
                )}{" "}
                /{" "}
                {
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "approved"
                  ).length
                }{" "}
                yêu cầu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportRequestTable
                data={filteredRequests.filter(
                  (req) => req.status.toLowerCase() === "approved"
                )}
                showStatus={false}
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "approved"
                  ).length
                )}{" "}
                /{" "}
                {
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "approved"
                  ).length
                }{" "}
                yêu cầu
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
                        exportRequests.filter(
                          (req) => req.status.toLowerCase() === "approved"
                        ).length / itemsPerPage
                      ),
                    },
                    (_, i) => i + 1
                  )
                    .slice(
                      Math.max(0, currentPage - 3),
                      Math.min(
                        Math.ceil(
                          exportRequests.filter(
                            (req) => req.status.toLowerCase() === "approved"
                          ).length / itemsPerPage
                        ),
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
                    Math.ceil(
                      exportRequests.filter(
                        (req) => req.status.toLowerCase() === "approved"
                      ).length / itemsPerPage
                    ) -
                      2 && (
                    <>
                      <PaginationItem>
                        <span>...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() =>
                            setCurrentPage(
                              Math.ceil(
                                exportRequests.filter(
                                  (req) =>
                                    req.status.toLowerCase() === "approved"
                                ).length / itemsPerPage
                              )
                            )
                          }
                          className="cursor-pointer"
                        >
                          {Math.ceil(
                            exportRequests.filter(
                              (req) => req.status.toLowerCase() === "approved"
                            ).length / itemsPerPage
                          )}
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
                            Math.ceil(
                              exportRequests.filter(
                                (req) => req.status.toLowerCase() === "approved"
                              ).length / itemsPerPage
                            )
                          )
                        )
                      }
                      className={
                        currentPage ===
                        Math.ceil(
                          exportRequests.filter(
                            (req) => req.status.toLowerCase() === "approved"
                          ).length / itemsPerPage
                        )
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

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu bị từ chối</CardTitle>
              <CardDescription>
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "rejected"
                  ).length
                )}{" "}
                /{" "}
                {
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "rejected"
                  ).length
                }{" "}
                yêu cầu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportRequestTable
                data={filteredRequests.filter(
                  (req) => req.status.toLowerCase() === "rejected"
                )}
                showStatus={false}
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "rejected"
                  ).length
                )}{" "}
                /{" "}
                {
                  exportRequests.filter(
                    (req) => req.status.toLowerCase() === "rejected"
                  ).length
                }{" "}
                yêu cầu
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
                        exportRequests.filter(
                          (req) => req.status.toLowerCase() === "rejected"
                        ).length / itemsPerPage
                      ),
                    },
                    (_, i) => i + 1
                  )
                    .slice(
                      Math.max(0, currentPage - 3),
                      Math.min(
                        Math.ceil(
                          exportRequests.filter(
                            (req) => req.status.toLowerCase() === "rejected"
                          ).length / itemsPerPage
                        ),
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
                    Math.ceil(
                      exportRequests.filter(
                        (req) => req.status.toLowerCase() === "rejected"
                      ).length / itemsPerPage
                    ) -
                      2 && (
                    <>
                      <PaginationItem>
                        <span>...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() =>
                            setCurrentPage(
                              Math.ceil(
                                exportRequests.filter(
                                  (req) =>
                                    req.status.toLowerCase() === "rejected"
                                ).length / itemsPerPage
                              )
                            )
                          }
                          className="cursor-pointer"
                        >
                          {Math.ceil(
                            exportRequests.filter(
                              (req) => req.status.toLowerCase() === "rejected"
                            ).length / itemsPerPage
                          )}
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
                            Math.ceil(
                              exportRequests.filter(
                                (req) => req.status.toLowerCase() === "rejected"
                              ).length / itemsPerPage
                            )
                          )
                        )
                      }
                      className={
                        currentPage ===
                        Math.ceil(
                          exportRequests.filter(
                            (req) => req.status.toLowerCase() === "rejected"
                          ).length / itemsPerPage
                        )
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
      </Tabs>

      {/* Dialog for approving export request */}
      {selectedRequest && (
        <ApproveExportDialog
          request={selectedRequest}
          open={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
          onApprove={(quantity) => {
            const approvalData: ApprovalData = {
              warehouseRequestExportId:
                selectedRequest.warehouseRequestExportId,
              quantityApproved: quantity,
              requestExportId: selectedRequest.requestExportId,
              productId: selectedRequest.productId,
              approvedBy: userId,
            };
            handleSubmitApproval(approvalData);
          }}
        />
      )}
      {/* Dialog for viewing export request details */}
      {selectedDetailId && (
        <ExportRequestDetailDialog
          warehouseRequestExportId={selectedDetailId}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}
    </div>
  );
}
