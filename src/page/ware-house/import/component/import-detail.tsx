import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import axios from "axios";

interface ImportDetailProps {
  importData: {
    id: string;
    documentNumber: string;
    date: string;
    importType: string;
    supplier: string;
    warehouse: string;
    status: string;
    totalValue: number;
    warehouseId?: number;
  };
}

interface BatchItem {
  batchCode: string;
  productId: number;
  productName?: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  dateOfManufacture: string;
  expiryDate?: string;
  status: string;
}

interface ProductDetail {
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
}

interface ImportResponse {
  warehouseReceiptId: number;
  documentNumber: string;
  documentDate: string;
  dateImport: string;
  warehouseId: number;
  importType: string;
  supplier: string;
  totalQuantity: number;
  totalPrice: number;
  isApproval: boolean;
  batches: BatchItem[];
}

export function ImportDetail({ importData }: ImportDetailProps) {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [importDetails, setImportDetails] = useState<ImportResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [productDetails, setProductDetails] = useState<
    Map<number, ProductDetail>
  >(new Map());
  const token = sessionStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch import details
  useEffect(() => {
    const fetchImportDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch import details from API
        const response = await axios.get(
          `${API_URL}WarehouseReceipt/${importData.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Handle response as array
        const responseData = response.data;
        console.log("Import details response:", responseData);

        // Check if response is an array and has items
        if (Array.isArray(responseData) && responseData.length > 0) {
          const data = responseData[0]; // Get the first item from the array
          setImportDetails(data);

          // Get batches from the data
          if (data.batches && Array.isArray(data.batches)) {
            setBatches(data.batches);

            // Fetch product details for each unique productId
            const uniqueProductIds = Array.from(
              new Set(data.batches.map((batch: BatchItem) => batch.productId))
            ) as number[];
            await fetchProductDetails(uniqueProductIds);
          } else {
            setBatches([]);
          }
        } else if (!Array.isArray(responseData) && responseData.batches) {
          // Handle case where response is a single object
          setImportDetails(responseData);
          setBatches(responseData.batches);

          // Fetch product details
          const uniqueProductIds = Array.from(
            new Set(
              responseData.batches.map((batch: BatchItem) => batch.productId)
            )
          ) as number[];
          await fetchProductDetails(uniqueProductIds);
        } else {
          // Fallback to empty array if no valid data
          setBatches([]);
        }
      } catch (error) {
        console.error("Error fetching import details:", error);
        toast.error("Không thể tải chi tiết phiếu nhập");
        setBatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (importData.id) {
      fetchImportDetails();
    }
  }, [importData.id, API_URL, token]);

  // Function to fetch product details
  const fetchProductDetails = async (productIds: number[]) => {
    try {
      const productDetailsMap = new Map<number, ProductDetail>();

      // Fetch details for each product ID
      const productPromises = productIds.map(async (productId) => {
        try {
          const response = await axios.get(`${API_URL}product/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data) {
            console.log(`Product ${productId} details:`, response.data);
            productDetailsMap.set(productId, response.data);
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      });

      await Promise.all(productPromises);
      setProductDetails(productDetailsMap);

      // Update batches with product names
      setBatches((prev) =>
        prev.map((batch) => ({
          ...batch,
          productName:
            productDetailsMap.get(batch.productId)?.productName ||
            `Sản phẩm ${batch.productId}`,
        }))
      );
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // Call API to approve import
      const response = await axios.post(
        `${API_URL}WarehouseReceipt/approve/${importData.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        toast.success("Phiếu nhập đã được duyệt thành công");

        // Update local state
        importData.status = "completed";

        // Update batches status
        setBatches((prev) =>
          prev.map((batch) => ({
            ...batch,
            status: "APPROVED",
          }))
        );
      } else {
        throw new Error("Failed to approve import");
      }
    } catch (error) {
      console.error("Error approving import:", error);
      toast.error("Không thể duyệt phiếu nhập");
    } finally {
      setIsApproving(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch (error) {
      console.log("Error formatting date:", error);

      return "N/A";
    }
  };

  // Check if import is pending
  const isPending =
    importDetails?.isApproval === false ||
    (importDetails?.isApproval === undefined &&
      (importData.status === "pending" ||
        batches.some((batch) => batch.status === "PENDING")));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Thông tin phiếu nhập
          </h3>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Mã phiếu nhập:</div>
              <div className="text-sm">
                {importDetails?.documentNumber || importData.documentNumber}
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Ngày nhập:</div>
              <div className="text-sm">
                {formatDate(importDetails?.dateImport || importData.date)}
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Loại nhập:</div>
              <div className="text-sm">
                {importDetails?.importType || importData.importType}
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Kho nhập:</div>
              <div className="text-sm">{importData.warehouse}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Trạng thái:</div>
              <div className="text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    !isPending
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {!isPending ? "Hoàn thành" : "Đang kiểm tra"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Tổng số lượng:</div>
              <div className="text-sm">
                {importDetails?.totalQuantity ||
                  batches.reduce((sum, b) => sum + b.quantity, 0)}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Thông tin nhà cung cấp
          </h3>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Nhà cung cấp:</div>
              <div className="text-sm">
                {importDetails?.supplier || importData.supplier}
              </div>
            </div>
          </div>

          {isPending && (
            <div className="mt-4">
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang duyệt...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Duyệt phiếu nhập
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Chi tiết sản phẩm
        </h3>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3">Đang tải...</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã lô</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Ngày sản xuất</TableHead>
                <TableHead>Hạn sử dụng</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead className="max-w-[120px]">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24">
                    Không có dữ liệu chi tiết
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch, index) => (
                  <TableRow key={index}>
                    <TableCell>{batch.batchCode}</TableCell>
                    <TableCell>
                      {batch.productName ||
                        productDetails.get(batch.productId)?.productName ||
                        `Sản phẩm ${batch.productId}`}
                    </TableCell>
                    <TableCell>{formatDate(batch.dateOfManufacture)}</TableCell>
                    <TableCell>{formatDate(batch.expiryDate || "")}</TableCell>
                    <TableCell>{batch.quantity}</TableCell>
                    <TableCell>{batch.unit}</TableCell>
                    <TableCell
                      className="max-w-[100px] truncate"
                      title={`${batch.unitCost.toLocaleString()} đ`}
                    >
                      {batch.unitCost.toLocaleString()} đ
                    </TableCell>
                    <TableCell
                      className="max-w-[120px] truncate"
                      title={`${batch.totalAmount.toLocaleString()} đ`}
                    >
                      {batch.totalAmount.toLocaleString()} đ
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow>
                <TableCell colSpan={7} className="text-right font-medium">
                  Tổng giá trị:
                </TableCell>
                <TableCell
                  className="font-bold max-w-[120px] truncate"
                  title={`${(
                    importDetails?.totalPrice || importData.totalValue
                  ).toLocaleString()} đ`}
                >
                  {(
                    importDetails?.totalPrice || importData.totalValue
                  ).toLocaleString()}
                  VNĐ
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Ghi chú
        </h3>
        <p className="text-sm text-muted-foreground">
          {!isPending
            ? "Hàng đã được kiểm tra chất lượng và nhập kho thành công."
            : "Hàng đã được kiểm tra số lượng. Đang tiến hành kiểm tra chất lượng."}
        </p>
      </div>
    </div>
  );
}
