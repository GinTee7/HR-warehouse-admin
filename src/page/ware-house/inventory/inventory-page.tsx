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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Package,
  AlertCircle,
  Calculator,
  Loader2,
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

interface InventoryItem {
  warehouseProductId: number;
  productId: number;
  productName: string;
  warehouseId: number;
  batchId: number;
  batchCode: string;
  expirationDate: string;
  quantity: number;
  price: number;
  status: string;
}

interface ProductSummary {
  productId: number;
  productName: string;
  totalQuantity: number;
  batches: number;
  nearExpiry: number;
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
  const token = sessionStorage.getItem("token");
  const warehouseId = sessionStorage.getItem("warehouseId") || "8";
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryItem | null>(
    null
  );
  const [profitMargin, setProfitMargin] = useState<string>("10");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch inventory data
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}${warehouseId}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  useEffect(() => {
    fetchInventory();
  }, [API_URL, token, warehouseId]);

  // Generate product summaries
  const generateProductSummaries = (items: InventoryItem[]) => {
    const productMap = new Map<number, ProductSummary>();

    items.forEach((item) => {
      const existingProduct = productMap.get(item.productId);
      const expiryDate = new Date(item.expirationDate);
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
        (statusFilter === "empty" && item.status === "");

      return matchesSearch && matchesStatus;
    });

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

    setFilteredItems(paginatedItems);
  }, [searchTerm, statusFilter, inventoryItems, currentPage, itemsPerPage]);

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
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Chờ xử lý
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

  // Check if a product is near expiry (within 3 months)
  const isNearExpiry = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  };

  const openPricingDialog = (item: InventoryItem) => {
    setSelectedBatch(item);
    setProfitMargin("10");
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kho hàng</h2>
        <p className="text-muted-foreground">
          Quản lý tồn kho và theo dõi sản phẩm
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productSummaries.length}</div>
            <p className="text-xs text-muted-foreground">
              {productSummaries
                .reduce((sum, product) => sum + product.totalQuantity, 0)
                .toLocaleString()}{" "}
              đơn vị
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lô hàng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {
                inventoryItems.filter((item) => item.status === "PENDING")
                  .length
              }{" "}
              lô đang chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hạn</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                inventoryItems.filter((item) =>
                  isNearExpiry(item.expirationDate)
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Lô hàng sắp hết hạn trong 3 tháng tới
            </p>
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
                {Math.min(currentPage * itemsPerPage, inventoryItems.length)} /{" "}
                {inventoryItems.length} sản phẩm
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
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="active">Đã duyệt</SelectItem>
                  <SelectItem value="calculating">Đang tính giá</SelectItem>
                  <SelectItem value="empty">Mới</SelectItem>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã sản phẩm</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Mã lô</TableHead>
                <TableHead>Hạn sử dụng</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Giá tiền đã tính giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    Không tìm thấy sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.warehouseProductId}>
                    <TableCell className="font-medium">
                      {item.productId}
                    </TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.batchCode}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {formatDate(item.expirationDate)}
                        {isNearExpiry(item.expirationDate) && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-red-50 text-red-700 border-red-200"
                          >
                            Sắp hết hạn
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity.toLocaleString()}</TableCell>
                    <TableCell>
                      {item.price != null
                        ? item.price.toLocaleString("vi-VN", {
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

      {/* Dialog tính giá */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tính giá sản phẩm</DialogTitle>
            <DialogDescription>
              Nhập tỷ lệ lợi nhuận (%) cho sản phẩm {selectedBatch?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="text-right">
                Sản phẩm
              </Label>
              <div className="col-span-3 font-medium">
                {selectedBatch?.productName}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batchCode" className="text-right">
                Mã lô
              </Label>
              <div className="col-span-3">{selectedBatch?.batchCode}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profitMargin" className="text-right">
                Tỷ lệ lợi nhuận (%)
              </Label>
              <Input
                id="profitMargin"
                type="number"
                min="1"
                max="100"
                className="col-span-3"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPricingDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateProfitMargin} disabled={isSubmitting}>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
