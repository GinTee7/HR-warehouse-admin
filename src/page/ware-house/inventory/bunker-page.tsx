"use client";

import { useState, useEffect } from "react";
import { Package, Search, AlertCircle, Loader2, Filter } from "lucide-react";
import {
  Card,
  CardContent,
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

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Product {
  productId: number;
  productName: string;
  totalQuantity: number;
  status: string;
}

export default function BunkerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const id = localStorage.getItem("warehouseId");
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `https://minhlong.mlhr.org/api/${id}/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and status
  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.status === "ACTIVE") ||
        (statusFilter === "inactive" && product.status !== "ACTIVE") ||
        (statusFilter === "in-stock" && product.totalQuantity > 0) ||
        (statusFilter === "out-of-stock" && product.totalQuantity === 0);

      return matchesSearch && matchesStatus;
    });

    setFilteredProducts(filtered);
  }, [searchTerm, statusFilter, products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);
  // Get status badge
  const getStatusBadge = (status: string, quantity: number) => {
    if (status !== "ACTIVE") {
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 border-gray-200"
        >
          Không hoạt động
        </Badge>
      );
    }

    if (quantity === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Hết hàng
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        Còn hàng
      </Badge>
    );
  };

  // Calculate summary statistics
  const totalProducts = products.length;

  const outOfStockCount = products.filter(
    (product) => product.totalQuantity === 0
  ).length;

  return (
    <div className="space-y-6" style={{ maxHeight: "90vh", overflowY: "auto" }}>
      <div></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Còn hàng</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.totalQuantity > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hàng</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center flex-col sm:flex-row gap-3">
            <div>
              <CardTitle>Danh sách sản phẩm trong kho</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên sản phẩm..."
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
                  <SelectItem value="in-stock">Còn hàng</SelectItem>
                  <SelectItem value="out-of-stock">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
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
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Không tìm thấy sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell className="text-right">
                      {product.totalQuantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(product.status, product.totalQuantity)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <CardFooter className="flex justify-between items-center border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredProducts.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredProducts.length)} /{" "}
              {filteredProducts.length} sản phẩm
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
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
