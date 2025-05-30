"use client";

import type React from "react";
import { forwardRef } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogFooter,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Định nghĩa các interface
interface Product {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  defaultExpiration: number;
  categoryId: number;
  description: string;
  taxId: number;
  availableStock: number;
  images: string[];
  unitCost: number;
}

interface ImportItem {
  productId: number;
  productName: string;
  productCode: string;
  unit: string;
  quantity: number;
  unitCost: number;
  DateOfManufacture: string;
  total: number;
}

interface ImportFormProps {
  onClose: () => void;
}

// Các loại đơn vị được phép
const ALLOWED_UNITS = ["Chai", "Bao"];

// Create a forwardRef wrapper for the product selection button
const ProductSelectButton = forwardRef<
  HTMLButtonElement,
  {
    isLoading: boolean;
    productName: string;
    productCode: string;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
  }
>((props, ref) => {
  const { isLoading, productName, productCode, onClick, className, disabled } =
    props;

  return (
    <Button
      ref={ref}
      variant="outline"
      className={`w-full justify-start text-left font-normal ${
        className || ""
      }`}
      disabled={disabled || isLoading}
      onClick={onClick}
      type="button"
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
          <span>Đang tải...</span>
        </div>
      ) : productName ? (
        <div className="flex flex-col">
          <span>{productName}</span>
          <span className="text-xs text-muted-foreground">{productCode}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">Chọn sản phẩm</span>
      )}
    </Button>
  );
});

// Add display name to avoid React warnings
ProductSelectButton.displayName = "ProductSelectButton";

export function ImportForm({ onClose }: ImportFormProps) {
  const [formData, setFormData] = useState({
    documentNumber: `IMP-${format(new Date(), "yyyyMMdd")}-001`,
    importDate: new Date().toISOString().split("T")[0],
    warehouseId: "",
    importType: "ImportProduction",
    supplier: "",
    note: "",
  });

  const [items, setItems] = useState<ImportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  const token = localStorage.getItem("token");
  const warehouseId = localStorage.getItem("warehouseId");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const navigate = useNavigate();
  // Set warehouse ID from session storage
  useEffect(() => {
    if (warehouseId) {
      setFormData((prev) => ({
        ...prev,
        warehouseId: warehouseId,
      }));
    }
  }, [warehouseId]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await axios.get(`${API_URL}product`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          const responseData = response.data.success
            ? response.data.data
            : response.data;
          setProducts(Array.isArray(responseData) ? responseData : []);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Không thể tải danh sách sản phẩm");
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [API_URL, token]);

  // Focus search input when product selector opens
  useEffect(() => {
    if (isProductSelectorOpen) {
      // Sử dụng setTimeout để đảm bảo DOM đã được cập nhật
      setTimeout(() => {
        const searchInput = document.getElementById("product-search");
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }, [isProductSelectorOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: 0,
        productName: "",
        productCode: "",
        unit: "",
        quantity: 1,
        unitCost: 0,
        DateOfManufacture: format(new Date(), "yyyy-MM-dd"),
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // If quantity or unitCost changed, update total
          if (field === "quantity" || field === "unitCost") {
            // Giới hạn giá trị tổng để tránh tràn số
            updatedItem.total = Math.min(
              updatedItem.quantity * updatedItem.unitCost,
              999999999999
            );
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const selectProduct = (productId: number) => {
    if (activeItemIndex === null) return;

    const product = products.find((p) => p.productId === productId);
    if (product) {
      setItems((prev) =>
        prev.map((item, i) => {
          if (i === activeItemIndex) {
            return {
              ...item,
              productId: product.productId,
              productName: product.productName,
              productCode: product.productCode,
              unit: product.unit,
              total: item.quantity * item.unitCost,
            };
          }
          return item;
        })
      );
      setIsProductSelectorOpen(false);
      setSearchTerm("");
    }
  };

  const openProductSelector = (index: number) => {
    setActiveItemIndex(index);
    setIsProductSelectorOpen(true);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((item) => Number(item.unitCost) === 0)) {
      toast.error("Không được để Đơn giá bằng 0 ở bất kỳ sản phẩm nào!");
      return;
    }
    // Validate form
    if (!formData.warehouseId || !formData.supplier || items.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Check if all items have product and quantity
    const invalidItems = items.some(
      (item) => !item.productId || item.quantity <= 0
    );
    if (invalidItems) {
      console.log("Invalid items:", items);
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for API
      const importData = {
        dateImport: formData.importDate,
        warehouseId: Number.parseInt(formData.warehouseId),
        importType: formData.importType,
        supplier: formData.supplier,
        note: formData.note,
        batches: items.map((item) => ({
          productId: item.productId,
          unit: item.unit,
          quantity: item.quantity,
          unitCost: item.unitCost,
          DateOfManufacture: item.DateOfManufacture,
        })),
      };

      // Call API to create import
      const response = await axios.post(
        `${API_URL}warehouse-receipts/create`,
        importData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Tạo phiếu nhập thành công");
        navigate("/warehouse/inventory");
        onClose();
      } else {
        throw new Error("Failed to create import");
      }
    } catch (error) {
      console.error("Error creating import:", error);
      toast.error("Không thể tạo phiếu nhập");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search term
  const filteredProducts =
    searchTerm.trim() === ""
      ? products
      : products.filter(
          (product) =>
            product.productName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            product.productCode.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="importDate">
            Ngày nhập <span className="text-red-500">*</span>
          </Label>
          <Input
            id="importDate"
            name="importDate"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={formData.importDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier">
            Nhà cung cấp <span className="text-red-500">*</span>
          </Label>
          <Input
            id="supplier"
            name="supplier"
            placeholder="Nhập tên nhà cung cấp"
            value={formData.supplier}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>
            Danh sách sản phẩm <span className="text-red-500">*</span>
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm sản phẩm
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Ngày sản xuất</TableHead>
                <TableHead>Thành tiền</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <ProductSelectButton
                        isLoading={isLoadingProducts}
                        productName={item.productName}
                        productCode={item.productCode}
                        onClick={() => openProductSelector(index)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.unit}
                        onValueChange={(value) =>
                          updateItem(index, "unit", value)
                        }
                        disabled={!item.productId}
                      >
                        <SelectTrigger className="w-[100px]" disabled>
                          <SelectValue placeholder="Đơn vị" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALLOWED_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        // chuyển thành text để dễ xử lý leading-zero
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        className="w-[80px]"
                        value={String(item.quantity)} // hiển thị đúng số nguyên
                        onChange={(e) => {
                          // chỉ giữ lại ký tự số
                          const digits = e.target.value.replace(/\D/g, "");
                          // parseInt sẽ loại bỏ 0 đầu; NaN -> 0
                          const parsed = parseInt(digits, 10) || 0;
                          // đảm bảo tối thiểu là 1
                          const value = Math.max(parsed, 1);
                          updateItem(index, "quantity", value);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        // đổi thành text + inputMode numeric để control chuỗi đầu vào
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        className="w-[100px]"
                        value={String(item.unitCost)} // hiển thị trực tiếp số nguyên
                        onChange={(e) => {
                          // chỉ lấy các ký tự số
                          const digits = e.target.value.replace(/\D/g, "");
                          // parseInt bỏ qua 0 đầu, NaN => 0
                          const parsed = parseInt(digits, 10);
                          const value = isNaN(parsed)
                            ? 0
                            : Math.min(parsed, 999_999_999); // giới hạn tối đa
                          updateItem(index, "unitCost", value);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={item.DateOfManufacture}
                        onChange={(e) =>
                          updateItem(index, "DateOfManufacture", e.target.value)
                        }
                        className="w-[140px]"
                      />
                    </TableCell>
                    <TableCell
                      className="max-w-[120px] truncate"
                      title={`${item.total.toLocaleString()} đ`}
                    >
                      {item.total.toLocaleString()} đ
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {items.length > 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    Tổng cộng:
                  </TableCell>
                  <TableCell
                    className="font-bold max-w-[120px] truncate"
                    title={`${calculateTotal().toLocaleString()} đ`}
                  >
                    {calculateTotal().toLocaleString()} đ
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú</Label>
        <Textarea
          id="note"
          name="note"
          placeholder="Nhập ghi chú (nếu có)"
          value={formData.note}
          onChange={handleInputChange}
          className="min-h-[80px]"
        />
      </div>

      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang lưu...
            </>
          ) : (
            "Tạo phiếu nhập"
          )}
        </Button>
      </DialogFooter>

      {/* Dialog cho chọn sản phẩm */}
      <Dialog
        open={isProductSelectorOpen}
        onOpenChange={setIsProductSelectorOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="product-search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="border rounded-md max-h-[300px] overflow-y-auto">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                  <span>Đang tải danh sách sản phẩm...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "Không tìm thấy sản phẩm phù hợp"
                    : "Không có sản phẩm nào"}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => selectProduct(product.productId)}
                    >
                      <div className="font-medium">{product.productName}</div>
                      <div className="text-sm text-muted-foreground flex justify-between mt-1">
                        <span>Mã: {product.productCode}</span>
                        <span>Đơn vị: {product.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProductSelectorOpen(false)}
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
