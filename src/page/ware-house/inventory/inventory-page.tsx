"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Package,
  Calculator,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import axios from "axios";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InventoryItem {
  productId: number;
  productName: string;
  batchCode: string;
  expiryDate: string;
  dateOfManufacture: string;
  quantity: number;
  totalAmount: number;
  profitMarginPercent: number;
  unitCost: number;
  sellingPrice: number;
  status: string;
  batchId: number;
}

interface ProductSummary {
  productId: number;
  productName: string;
  totalQuantity: number;
  batches: number;
  nearExpiry: number;
}

interface DamagedStock {
  createdAt: string;
  damagedStockId: number;
  productId: number;
  productName: string;
  quantity: number;
  reason: string;
  status: string;
  warehouseId: number;
  warehouseName: string;
  batchCode: string;
  orderCode: string;
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [productSummaries, setProductSummaries] = useState<ProductSummary[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const token = localStorage.getItem("token");
  const warehouseId = localStorage.getItem("warehouseId") || "8";
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:localhost:3000";

  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryItem | null>(
    null
  );
  const [profitMargin, setProfitMargin] = useState<string>("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [damagedStocks, setDamagedStocks] = useState<DamagedStock[]>([]);
  const [filteredDamagedStocks, setFilteredDamagedStocks] = useState<
    DamagedStock[]
  >([]);
  const [damagedStockSearchTerm, setDamagedStockSearchTerm] = useState("");
  const [damagedStockStatusFilter, setDamagedStockStatusFilter] =
    useState("all");
  const [damagedStockCurrentPage, setDamagedStockCurrentPage] = useState(1);
  const [damagedStockItemsPerPage, setDamagedStockItemsPerPage] = useState(10);
  const [isDamagedStockLoading, setIsDamagedStockLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inventory");

  // Add these new state variables after the other state declarations
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [batchToCancel, setBatchToCancel] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editBatch, setEditBatch] = useState<InventoryItem | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editProfitMargin, setEditProfitMargin] = useState<number>(0);
  const [editDateOfManufacture, setEditDateOfManufacture] =
    useState<string>("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Fetch inventory data
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}batch/batches/warehouse/${warehouseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setInventoryItems(response.data);
        generateProductSummaries(response.data);
      } else {
        setInventoryItems([]);
        setFilteredItems([]);
        setProductSummaries([]);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Không thể tải dữ liệu kho hàng");
      setInventoryItems([]);
      setFilteredItems([]);
      setProductSummaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch damaged stock data
  const fetchDamagedStock = async () => {
    setIsDamagedStockLoading(true);
    try {
      const response = await axios.get(
        `https://minhlong.mlhr.org/api/DamagedStock/warehouse`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setDamagedStocks(response.data);
        setFilteredDamagedStocks(response.data);
      } else {
        setDamagedStocks([]);
        setFilteredDamagedStocks([]);
      }
    } catch (error) {
      console.error("Error fetching damaged stock:", error);
      toast.error("Không thể tải dữ liệu xuất hủy");
      setDamagedStocks([]);
      setFilteredDamagedStocks([]);
    } finally {
      setIsDamagedStockLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [API_URL, token, warehouseId]);

  useEffect(() => {
    if (activeTab === "damaged") {
      fetchDamagedStock();
    }
  }, [activeTab]);

  // Generate product summaries
  const generateProductSummaries = (items: InventoryItem[]) => {
    const productMap = new Map<number, ProductSummary>();

    items.forEach((item) => {
      const existingProduct = productMap.get(item.productId);
      const expiryDate = new Date(item.expiryDate);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      const isNearExpiry = expiryDate <= threeMonthsFromNow;

      if (existingProduct) {
        existingProduct.totalQuantity += item.quantity;
        existingProduct.batches += 1;
        if (isNearExpiry) {
          existingProduct.nearExpiry += 1;
        }
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: item.quantity,
          batches: 1,
          nearExpiry: isNearExpiry ? 1 : 0,
        });
      }
    });

    setProductSummaries(Array.from(productMap.values()));
  };

  // Filter and paginate inventory items
  useEffect(() => {
    const filtered = inventoryItems.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && item.status === "PENDING") ||
        (statusFilter === "calculating" &&
          item.status === "CALCULATING_PRICE") ||
        (statusFilter === "active" && item.status === "ACTIVE") ||
        (statusFilter === "expired" && item.status === "EXPIRED") ||
        (statusFilter === "expired_soon" && item.status === "EXPIRED_SOON");

      return matchesSearch && matchesStatus;
    });

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

    setFilteredItems(paginatedItems);
  }, [searchTerm, statusFilter, inventoryItems, currentPage, itemsPerPage]);

  // Filter damaged stock items
  useEffect(() => {
    const filtered = damagedStocks.filter((item) => {
      const matchesSearch = item.productName
        .toLowerCase()
        .includes(damagedStockSearchTerm.toLowerCase());

      const matchesStatus =
        damagedStockStatusFilter === "all" ||
        (damagedStockStatusFilter === "exportcancel" &&
          item.status === "ExportCancel") ||
        (damagedStockStatusFilter === "return" && item.status === "Return") ||
        (damagedStockStatusFilter === "rejected" && item.status === "REJECTED");

      return matchesSearch && matchesStatus;
    });

    // Tính toán phân trang
    const indexOfLastItem = damagedStockCurrentPage * damagedStockItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - damagedStockItemsPerPage;
    const paginatedItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

    setFilteredDamagedStocks(paginatedItems);
  }, [
    damagedStockSearchTerm,
    damagedStockStatusFilter,
    damagedStocks,
    damagedStockCurrentPage,
    damagedStockItemsPerPage,
  ]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      console.log("Error formatting date:", error);
      return "N/A";
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EXPIRED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Hết hạn
          </Badge>
        );
      case "CALCULATING_PRICE":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Đang tính giá
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Đã duyệt
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Đã hủy
          </Badge>
        );
      case "EXPIRED_SOON":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Sắp hết hạn
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Mới
          </Badge>
        );
    }
  };

  // Get damaged stock status badge
  const getDamagedStockStatusBadge = (status: string) => {
    switch (status) {
      case "ExportCancel":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Hàng hủy
          </Badge>
        );
      case "Return":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Hàng trả
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Chờ duyệt
          </Badge>
        );
    }
  };

  const openPricingDialog = (item: InventoryItem) => {
    setSelectedBatch(item);
    setProfitMargin(item.profitMarginPercent?.toString() || "10");
    setIsPricingDialogOpen(true);
  };

  const handleUpdateProfitMargin = async () => {
    if (!selectedBatch) return;

    const marginValue = Number.parseFloat(profitMargin);
    if (isNaN(marginValue) || marginValue <= 0 || marginValue > 100) {
      toast.error("Tỷ lệ lợi nhuận phải là số dương và không vượt quá 100%");
      return;
    }

    setIsSubmitting(true);
    try {
      // Assuming the API endpoint uses batchCode instead of batchId now
      const response = await axios.put(
        `${API_URL}batch/update-profit-margin/${selectedBatch.batchId}/${marginValue}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 204) {
        toast.success("Cập nhật tỷ lệ lợi nhuận thành công");
        setIsPricingDialogOpen(false);
        fetchInventory();
      } else {
        throw new Error("Không thể cập nhật tỷ lệ lợi nhuận");
      }
    } catch (error) {
      console.error("Error updating profit margin:", error);
      toast.error("Không thể cập nhật tỷ lệ lợi nhuận. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelExpired = (batchId: number) => {
    setBatchToCancel(batchId);
    setCancelReason("");
    setIsCancelDialogOpen(true);
  };

  // Add this new function after handleCancelExpired
  const confirmCancelExpired = async () => {
    if (!batchToCancel) return;

    try {
      setIsLoading(true);
      // Use the entered reason or default if empty
      const reason = cancelReason.trim() || "Hàng hết hạn";

      const response = await axios.post(
        `https://minhlong.mlhr.org/api/batch/cancel-expired/${batchToCancel}`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 204) {
        toast.success("Đã hủy lô hàng hết hạn thành công");
        setIsCancelDialogOpen(false);
        fetchInventory();
      } else {
        throw new Error("Không thể hủy lô hàng");
      }
    } catch (error) {
      console.error("Error cancelling expired batch:", error);
      toast.error("Không thể hủy lô hàng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };
  function getTodayVN() {
    const now = new Date();
    // Chuyển sang VN (GMT+7)
    now.setHours(now.getHours() + 7 - now.getTimezoneOffset() / 60);
    return now.toISOString().slice(0, 10);
  }
  return (
    <div className="space-y-6" style={{ maxHeight: "90vh", overflowY: "auto" }}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Hàng nhập</TabsTrigger>
          <TabsTrigger value="damaged">Hàng hủy</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng sản phẩm
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productSummaries.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng lô hàng
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inventoryItems.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center flex-col sm:flex-row gap-3">
                <div>
                  <CardTitle>Danh sách sản phẩm trong kho</CardTitle>
                  <CardDescription>
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      inventoryItems.length
                    )}{" "}
                    / {inventoryItems.length} sản phẩm
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm theo tên sản phẩm, mã lô..."
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
                      <SelectItem value="pending">Chờ xử lí</SelectItem>
                      <SelectItem value="active">Đã duyệt</SelectItem>
                      <SelectItem value="calculating">Đang tính giá</SelectItem>
                      <SelectItem value="expired">Hết hạn</SelectItem>
                      <SelectItem value="expired_soon">Sắp hết hạn</SelectItem>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Mã lô</TableHead>
                    <TableHead>Hạn sử dụng</TableHead>
                    <TableHead>Ngày sản xuất</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Giá nhập</TableHead>
                    <TableHead>Giá bán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center h-24">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span className="ml-3">Đang tải...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center h-24">
                        Không tìm thấy sản phẩm nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item, index) => (
                      <TableRow
                        key={`${item.productId}-${item.batchCode}-${index}`}
                      >
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.batchCode}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {formatDate(item.expiryDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(item.dateOfManufacture)}
                        </TableCell>
                        <TableCell>{item.quantity.toLocaleString()}</TableCell>
                        <TableCell>
                          {item.unitCost != null
                            ? item.unitCost.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {item.sellingPrice != null
                            ? item.sellingPrice.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          {item.status === "CALCULATING_PRICE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPricingDialog(item)}
                            >
                              <Calculator className="h-4 w-4 mr-1" />
                              Tính giá
                            </Button>
                          )}
                          {item.status === "EXPIRED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                              onClick={() => handleCancelExpired(item.batchId)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xuất hủy
                            </Button>
                          )}
                          {item.status === "ACTIVE" && (
                            <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                              Đã tính giá
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => {
                              setEditBatch(item);
                              setEditQuantity(item.quantity);
                              setEditProfitMargin(item.profitMarginPercent);
                              setEditDateOfManufacture(
                                item.dateOfManufacture.slice(0, 10)
                              );
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <span className="mr-1">📝</span>Chỉnh sửa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, inventoryItems.length)} /{" "}
                {inventoryItems.length} sản phẩm
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
                    { length: Math.ceil(inventoryItems.length / itemsPerPage) },
                    (_, i) => i + 1
                  )
                    .slice(
                      Math.max(0, currentPage - 3),
                      Math.min(
                        Math.ceil(inventoryItems.length / itemsPerPage),
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
                    Math.ceil(inventoryItems.length / itemsPerPage) - 2 && (
                    <>
                      <PaginationItem>
                        <span>...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() =>
                            setCurrentPage(
                              Math.ceil(inventoryItems.length / itemsPerPage)
                            )
                          }
                          className="cursor-pointer"
                        >
                          {Math.ceil(inventoryItems.length / itemsPerPage)}
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
                            Math.ceil(inventoryItems.length / itemsPerPage)
                          )
                        )
                      }
                      className={
                        currentPage ===
                        Math.ceil(inventoryItems.length / itemsPerPage)
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

        <TabsContent value="damaged">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center flex-col sm:flex-row gap-3">
                <div>
                  <CardTitle>Danh sách xuất hủy</CardTitle>
                  <CardDescription>
                    Hiển thị{" "}
                    {(damagedStockCurrentPage - 1) * damagedStockItemsPerPage +
                      1}{" "}
                    -{" "}
                    {Math.min(
                      damagedStockCurrentPage * damagedStockItemsPerPage,
                      damagedStocks.length
                    )}{" "}
                    / {damagedStocks.length} phiếu xuất hủy
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative w-[250px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Tìm theo tên sản phẩm, mã lô..."
                      className="pl-8"
                      value={damagedStockSearchTerm}
                      onChange={(e) =>
                        setDamagedStockSearchTerm(e.target.value)
                      }
                    />
                  </div>
                  <Select
                    value={damagedStockStatusFilter}
                    onValueChange={setDamagedStockStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="exportcancel">Hàng hủy</SelectItem>
                      <SelectItem value="return">Hàng trả</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={damagedStockItemsPerPage.toString()}
                    onValueChange={(value) => {
                      setDamagedStockItemsPerPage(Number.parseInt(value));
                      setDamagedStockCurrentPage(1);
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã tham chiếu</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDamagedStockLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span className="ml-3">Đang tải...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDamagedStocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Không tìm thấy phiếu xuất hủy nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDamagedStocks.map((item, index) => (
                      <TableRow key={`damaged-${item.damagedStockId}-${index}`}>
                        <TableCell>
                          {" "}
                          {item.status === "Return"
                            ? item.orderCode
                            : item.batchCode}
                        </TableCell>
                        <TableCell>{item.productName}</TableCell>

                        <TableCell>{item.quantity.toLocaleString()}</TableCell>
                        <TableCell>{item.reason}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>
                          {getDamagedStockStatusBadge(item.status)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {(damagedStockCurrentPage - 1) * damagedStockItemsPerPage + 1} -{" "}
                {Math.min(
                  damagedStockCurrentPage * damagedStockItemsPerPage,
                  damagedStocks.length
                )}{" "}
                / {damagedStocks.length} phiếu xuất hủy
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setDamagedStockCurrentPage((prev) =>
                          Math.max(prev - 1, 1)
                        )
                      }
                      className={
                        damagedStockCurrentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {damagedStockCurrentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setDamagedStockCurrentPage(1)}
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
                        damagedStocks.length / damagedStockItemsPerPage
                      ),
                    },
                    (_, i) => i + 1
                  )
                    .slice(
                      Math.max(0, damagedStockCurrentPage - 3),
                      Math.min(
                        Math.ceil(
                          damagedStocks.length / damagedStockItemsPerPage
                        ),
                        damagedStockCurrentPage + 2
                      )
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setDamagedStockCurrentPage(page)}
                          isActive={damagedStockCurrentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  {damagedStockCurrentPage <
                    Math.ceil(damagedStocks.length / damagedStockItemsPerPage) -
                      2 && (
                    <>
                      <PaginationItem>
                        <span>...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() =>
                            setDamagedStockCurrentPage(
                              Math.ceil(
                                damagedStocks.length / damagedStockItemsPerPage
                              )
                            )
                          }
                          className="cursor-pointer"
                        >
                          {Math.ceil(
                            damagedStocks.length / damagedStockItemsPerPage
                          )}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setDamagedStockCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(
                              damagedStocks.length / damagedStockItemsPerPage
                            )
                          )
                        )
                      }
                      className={
                        damagedStockCurrentPage ===
                        Math.ceil(
                          damagedStocks.length / damagedStockItemsPerPage
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

      {/* Dialog tính giá */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-lg">
          <div className="bg-emerald-500 p-5">
            <DialogHeader className="text-white p-0 space-y-1">
              <DialogTitle className="text-xl font-bold">
                Tính giá sản phẩm
              </DialogTitle>
              <DialogDescription className="text-white/90">
                Nhập tỷ lệ lợi nhuận (%) cho sản phẩm{" "}
                {selectedBatch?.productName}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center">
              <div className="w-[120px] text-right text-gray-500 pr-4">
                Sản phẩm
              </div>
              <div className="flex-1 font-medium">
                {selectedBatch?.productName}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-[120px] text-right text-gray-500 pr-4">
                Mã lô
              </div>
              <div className="flex-1 bg-gray-50 p-2 rounded">
                {selectedBatch?.batchCode}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-[120px] text-right text-gray-500 pr-4">
                Giá nhập
              </div>
              <div className="flex-1 font-medium">
                {selectedBatch?.unitCost
                  ?.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                  .replace("đ", "đ") || "N/A"}
              </div>
            </div>

            <div className="flex items-center">
              <Label
                htmlFor="profitMargin"
                className="w-[120px] text-right text-gray-500 pr-4"
              >
                Tỷ lệ lợi nhuận (%)
              </Label>
              <div className="flex-1">
                <Input
                  id="profitMargin"
                  type="number"
                  min="1"
                  max="100"
                  className="w-full"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                />
              </div>
            </div>

            {/* Hiển thị giá bán dự kiến */}
            {profitMargin && selectedBatch?.unitCost && (
              <div className="flex items-center bg-emerald-50 p-3 rounded-md">
                <div className="w-[120px] text-right text-gray-500 pr-4">
                  Giá bán dự kiến
                </div>
                <div className="flex-1 font-bold text-emerald-700">
                  {(selectedBatch.unitCost * (1 + Number(profitMargin) / 100))
                    .toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })
                    .replace("đ", "đ")}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 p-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsPricingDialogOpen(false)}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateProfitMargin}
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Xác nhận
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận hủy lô hàng */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-lg">
          <div className="bg-red-500 p-5">
            <DialogHeader className="text-white p-0 space-y-1">
              <DialogTitle className="text-xl font-bold">
                Xác nhận xuất hủy
              </DialogTitle>
              <DialogDescription className="text-white/90">
                Vui lòng nhập lý do xuất hủy lô hàng này
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Lý do xuất hủy</Label>
              <Input
                id="cancelReason"
                placeholder="Nhập lý do xuất hủy..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Nếu không nhập lý do, hệ thống sẽ sử dụng lý do mặc định "Hàng
                hết hạn"
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              onClick={confirmCancelExpired}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xác nhận xuất hủy
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-lg">
          <div className="bg-blue-500 p-5">
            <DialogHeader className="text-white p-0 space-y-1">
              <DialogTitle className="text-xl font-bold">
                Chỉnh sửa lô hàng
              </DialogTitle>
              <DialogDescription className="text-white/90">
                Chỉnh sửa thông tin cho lô <b>{editBatch?.batchCode}</b>
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center">
              <Label className="w-[120px] text-right text-gray-500 pr-4">
                Số lượng
              </Label>
              <Input
                type="number"
                value={editQuantity}
                min={0}
                onChange={(e) => setEditQuantity(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center">
              <Label className="w-[120px] text-right text-gray-500 pr-4">
                Tỷ lệ lợi nhuận (%)
              </Label>
              <Input
                type="number"
                placeholder="Nhập % lợi nhuận..."
                value={editProfitMargin === 0 ? "" : editProfitMargin}
                min={1}
                max={100}
                onChange={(e) => {
                  const value = e.target.value.replace(/^0+/, ""); // loại bỏ tất cả số 0 đầu
                  setEditProfitMargin(value === "" ? 0 : Number(value));
                }}
              />
            </div>
            <div className="flex items-center">
              <Label className="w-[120px] text-right text-gray-500 pr-4">
                Ngày sản xuất
              </Label>
              <Input
                type="date"
                value={editDateOfManufacture}
                max={getTodayVN()}
                onChange={(e) => setEditDateOfManufacture(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (!editBatch) return;
                setIsEditSubmitting(true);
                try {
                  const payload = {
                    quantity: editQuantity,
                    profitMarginPercent: editProfitMargin,
                    dateOfManufacture: new Date(
                      editDateOfManufacture
                    ).toISOString(),
                  };
                  const response = await axios.put(
                    `https://minhlong.mlhr.org/api/batch/batches/${editBatch.batchId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  if (response.status === 200 || response.status === 204) {
                    toast.success("Cập nhật lô hàng thành công");
                    setIsEditDialogOpen(false);
                    fetchInventory();
                  } else {
                    throw new Error("Không thể cập nhật lô hàng");
                  }
                } catch (error) {
                  console.log(error);
                  toast.error("Không thể cập nhật lô hàng");
                } finally {
                  setIsEditSubmitting(false);
                }
              }}
              disabled={isEditSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              {isEditSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>Xác nhận</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
