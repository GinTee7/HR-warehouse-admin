import type React from "react";
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
import { DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface ExportFormProps {
  onClose: () => void;
}

// Cập nhật interface cho dữ liệu form: đổi requestExportId -> warehouseRequestExportId
interface ExportFormData {
  documentNumber: string;
  documentDate: string;
  exportDate: string;
  exportType: string;
  warehouseId: number | string;
  warehouseRequestExportId: number | null;
  note: string;
}

// Interface cho item xuất kho
interface ExportItem {
  warehouseProductId: number;
  productId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalProductAmount: number;
  expiryDate: string;
}

// Interface cho inventory items từ API
interface InventoryItem {
  warehouseProductId: number;
  productId: number;
  productName: string;
  warehouseId: number;
  batchId: number;
  batchCode: string;
  expirationDate: string;
  quantity: number;
  status: string;
  unit?: string;
  price?: number;
}

// Interface cho request export items
interface RequestExportItem {
  warehouseRequestExportId: number;
  requestExportId: number;
  productId: number;
  quantityRequested: number;
  remainingQuantity: number;
  productName: string;
  orderCode: string;
  agencyName: string;
  status: string;
}

const EXPORT_TYPES = [
  "Xuất hàng",
  "Xuất trả",
  "Xuất hủy",
  "Xuất kiểm kê",
  "Xuất khác",
];

export function ExportForm({ onClose }: ExportFormProps) {
  // State cho form data sử dụng warehouseRequestExportId
  const [formData, setFormData] = useState<ExportFormData>({
    documentNumber: `XK-${new Date().getTime().toString().slice(-6)}`,
    documentDate: new Date().toISOString().split("T")[0],
    exportDate: new Date().toISOString().split("T")[0],
    exportType: "Xuất hàng",
    warehouseId: "",
    warehouseRequestExportId: null,
    note: "",
  });

  // State cho danh sách sản phẩm xuất kho
  const [items, setItems] = useState<ExportItem[]>([]);

  // State cho inventory và request export
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredInventoryItems, setFilteredInventoryItems] = useState<
    InventoryItem[]
  >([]);
  const [requestExports, setRequestExports] = useState<RequestExportItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isLoadingRequestExports, setIsLoadingRequestExports] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  const token = sessionStorage.getItem("token");
  const warehouseId = sessionStorage.getItem("warehouseId") || "8";
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch inventory và request export khi component mount
  useEffect(() => {
    fetchInventory();
    fetchRequestExports();
  }, []);

  // Lấy dữ liệu sản phẩm từ API
  const fetchInventory = async () => {
    setIsLoadingInventory(true);
    try {
      const response = await axios.get(`${API_URL}${warehouseId}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        const processedItems = response.data.map((item: InventoryItem) => ({
          ...item,
          unit: item.unit || "Cái",
          price: item.price || 0,
        }));
        setInventoryItems(processedItems);
        setFilteredInventoryItems(processedItems);

        setFormData((prev) => ({
          ...prev,
          warehouseId: Number(warehouseId),
        }));
      } else {
        setInventoryItems([]);
        setFilteredInventoryItems([]);
        toast.error("Không thể tải dữ liệu sản phẩm");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Không thể tải dữ liệu sản phẩm");
      setInventoryItems([]);
      setFilteredInventoryItems([]);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Lấy danh sách request export từ API
  const fetchRequestExports = async () => {
    setIsLoadingRequestExports(true);
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
        setRequestExports(response.data);
      } else {
        setRequestExports([]);
      }
    } catch (error) {
      console.error("Error fetching request exports:", error);
      toast.error("Không thể tải danh sách yêu cầu xuất kho");
      setRequestExports([]);
    } finally {
      setIsLoadingRequestExports(false);
    }
  };

  // Lọc sản phẩm theo từ khóa
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInventoryItems(inventoryItems);
    } else {
      const filtered = inventoryItems.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.productId.toString().includes(searchTerm) ||
          item.batchCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInventoryItems(filtered);
    }
  }, [searchTerm, inventoryItems]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Chỉnh sửa hàm handleSelectChange để xử lý warehouseRequestExportId
  const handleSelectChange = (name: string, value: string) => {
    if (name === "warehouseRequestExportId") {
      if (value === "none") {
        setFormData((prev) => ({ ...prev, [name]: null }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: Number(value) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addItem = () => {
    setSelectedProductIndex(items.length);
    setIsProductSelectorOpen(true);
    setSearchTerm("");
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Hạn chế số lượng nhập không vượt quá số lượng tồn kho
  const updateItemQuantity = (index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const inventoryItem = inventoryItems.find(
            (invItem) => invItem.warehouseProductId === item.warehouseProductId
          );
          const maxQuantity = inventoryItem?.quantity || 1;
          const newQuantity = Math.min(Math.max(1, quantity), maxQuantity);

          if (quantity > maxQuantity) {
            toast.warning(`Số lượng không thể vượt quá ${maxQuantity}`);
          }

          return {
            ...item,
            quantity: newQuantity,
            totalProductAmount: newQuantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const selectProduct = (product: InventoryItem) => {
    if (selectedProductIndex === null) return;

    const existingIndex = items.findIndex(
      (item) => item.warehouseProductId === product.warehouseProductId
    );

    if (existingIndex !== -1 && existingIndex !== selectedProductIndex) {
      toast.error("Sản phẩm này đã được thêm vào danh sách");
      return;
    }

    const newItem: ExportItem = {
      warehouseProductId: product.warehouseProductId,
      productId: product.productId,
      productName: product.productName,
      batchNumber: product.batchCode,
      quantity: 1,
      unitPrice: product.price || 0,
      totalProductAmount: product.price || 0,
      expiryDate: product.expirationDate,
    };

    if (selectedProductIndex < items.length) {
      setItems((prev) =>
        prev.map((item, i) => (i === selectedProductIndex ? newItem : item))
      );
    } else {
      setItems((prev) => [...prev, newItem]);
    }
    toast.info(`Số lượng tối đa có thể xuất: ${product.quantity}`);

    setIsProductSelectorOpen(false);
    setSelectedProductIndex(null);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalProductAmount, 0);
  };

  // Cập nhật handleSubmit để gửi warehouseRequestExportId thay vì requestExportId
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.documentNumber || items.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const invalidItems = items.some((item) => item.quantity <= 0);
    if (invalidItems) {
      toast.error("Vui lòng kiểm tra lại số lượng sản phẩm");
      return;
    }

    const exportData = {
      documentNumber: formData.documentNumber,
      documentDate: new Date(formData.documentDate).toISOString(),
      exportDate: new Date(formData.exportDate).toISOString(),
      exportType: formData.exportType,
      warehouseId: Number(warehouseId),
      // Gửi warehouseRequestExportId đã chọn (nếu chưa chọn sẽ chuyển thành 0)
      warehouseRequestExportId: formData.warehouseRequestExportId || 0,
      details: items.map((item) => ({
        warehouseProductId: item.warehouseProductId,
        productId: item.productId,
        productName: item.productName,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalProductAmount: item.totalProductAmount,
        expiryDate: new Date(item.expiryDate).toISOString(),
      })),
    };

    console.log("Form data:", exportData);
    submitExportData(exportData);
  };

  const submitExportData = async (exportData: any) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}export-receipts`,
        exportData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Tạo phiếu xuất thành công");
        onClose();
      } else {
        throw new Error("Không thể tạo phiếu xuất");
      }
    } catch (error) {
      console.error("Error creating export:", error);
      toast.error("Không thể tạo phiếu xuất. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm định dạng ngày hiển thị
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      console.log("Error formatting date:", error);
      return "N/A";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 py-4">
        {/* Các trường thông tin chung */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="documentNumber">
              Mã phiếu xuất <span className="text-red-500">*</span>
            </Label>
            <Input
              id="documentNumber"
              name="documentNumber"
              placeholder="Nhập mã phiếu xuất"
              value={formData.documentNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentDate">
              Ngày lập phiếu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="documentDate"
              name="documentDate"
              type="date"
              value={formData.documentDate}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="exportDate">
              Ngày xuất <span className="text-red-500">*</span>
            </Label>
            <Input
              id="exportDate"
              name="exportDate"
              type="date"
              value={formData.exportDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exportType">
              Loại xuất <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.exportType}
              onValueChange={(value) => handleSelectChange("exportType", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại xuất" />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chọn warehouseRequestExportId */}
        <div className="space-y-2">
          <Label htmlFor="warehouseRequestExportId">Yêu cầu xuất kho</Label>
          <Select
            value={formData.warehouseRequestExportId?.toString() || ""}
            onValueChange={(value) =>
              handleSelectChange("warehouseRequestExportId", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn yêu cầu xuất kho (nếu có)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không có yêu cầu</SelectItem>
              {isLoadingRequestExports ? (
                <SelectItem value="loading" disabled>
                  Đang tải...
                </SelectItem>
              ) : requestExports.length === 0 ? (
                <SelectItem value="empty" disabled>
                  Không có yêu cầu xuất kho
                </SelectItem>
              ) : (
                requestExports.map((req) => (
                  <SelectItem
                    key={req.warehouseRequestExportId}
                    value={req.warehouseRequestExportId.toString()}
                  >
                    Yêu cầu #{req.warehouseRequestExportId} - {req.productName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Danh sách sản phẩm */}
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
                  <TableHead>Mã lô</TableHead>
                  <TableHead>Hạn sử dụng</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Đơn giá</TableHead>
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
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          Mã: {item.productId}
                        </div>
                      </TableCell>
                      <TableCell>{item.batchNumber}</TableCell>
                      <TableCell>{formatDate(item.expiryDate)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d+$/.test(value)) {
                              updateItemQuantity(
                                index,
                                value === "" ? 0 : Number.parseInt(value, 10)
                              );
                            }
                          }}
                          className="w-[80px]"
                        />
                      </TableCell>
                      <TableCell>{item.unitPrice.toLocaleString()} đ</TableCell>
                      <TableCell>
                        {item.totalProductAmount.toLocaleString()} đ
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
                    <TableCell className="font-bold">
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
      </div>

      {/* Product Selector Dialog */}
      {isProductSelectorOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[800px] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Chọn sản phẩm từ kho</h3>
              <div className="mt-2 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên sản phẩm, mã sản phẩm, mã lô..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-auto flex-1 p-4">
              {isLoadingInventory ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Đang tải dữ liệu sản phẩm...</span>
                </div>
              ) : filteredInventoryItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Không tìm thấy sản phẩm nào phù hợp
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredInventoryItems.map((product) => (
                    <div
                      key={product.warehouseProductId}
                      className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => selectProduct(product)}
                    >
                      <div className="font-medium">{product.productName}</div>
                      <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Mã SP:</span>{" "}
                          {product.productId}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mã lô:</span>{" "}
                          {product.batchCode}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Số lượng:
                          </span>{" "}
                          {product.quantity}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Hạn sử dụng:
                          </span>{" "}
                          {formatDate(product.expirationDate)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Trạng thái:
                          </span>{" "}
                          {product.status || "Mới"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProductSelectorOpen(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Tạo phiếu xuất"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
