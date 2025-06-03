"use client";

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

// Updated interface to match the new data structure
interface ImportDetailProps {
  importData: {
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
  discount: number;
  finalPrice: number;
}

export function ImportDetail({ importData }: ImportDetailProps) {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [productDetails, setProductDetails] = useState<
    Map<number, ProductDetail>
  >(new Map());
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch import details
  useEffect(() => {
    const fetchImportDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch import details from API
        const response = await axios.get(
          `${API_URL}warehouse-receipts/${importData.warehouseReceiptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Handle response
        const responseData = response.data.success
          ? response.data.data
          : response.data;
        console.log("Import details response:", responseData);

        // If we have batches in the importData, use them directly
        if (importData.batches && Array.isArray(importData.batches)) {
          setBatches(importData.batches);

          // Fetch product details for each unique productId
          const uniqueProductIds = Array.from(
            new Set(
              importData.batches.map((batch: BatchItem) => batch.productId)
            )
          ) as number[];
          await fetchProductDetails(uniqueProductIds);
        }
        // Otherwise try to get them from the API response
        else if (responseData && responseData.batches) {
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

        // If API call fails but we have batches in importData, use them
        if (importData.batches && Array.isArray(importData.batches)) {
          setBatches(importData.batches);

          const uniqueProductIds = Array.from(
            new Set(
              importData.batches.map((batch: BatchItem) => batch.productId)
            )
          ) as number[];
          await fetchProductDetails(uniqueProductIds);
        } else {
          setBatches([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchImportDetails();
  }, [importData, API_URL, token]);

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
            console.log(`Product details for ${productId}:`, response.data);

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
        `${API_URL}WarehouseReceipt/approve/${importData.warehouseReceiptId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        toast.success("Phiếu nhập đã được duyệt thành công");

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

  const getImportTypeDisplay = (importType: string) => {
    switch (importType) {
      case "ImportCoordination":
        return "Nhập điều phối";
      case "ImportProduction":
        return "Nhập hàng mới";
      case "AvailableExport":
        return "Sẵn hàng";
      default:
        return importType;
    }
  };
  return (
    <div className="space-y-6" style={{ maxHeight: "80vh", overflowY: "auto" }}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Thông tin phiếu nhập
          </h3>
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Mã phiếu nhập:</div>
              <div className="text-sm">{importData.documentNumber}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Ngày nhập:</div>
              <div className="text-sm">
                {formatDate(importData.documentDate)}
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Loại nhập:</div>
              <div className="text-sm">
                {getImportTypeDisplay(importData.importType)}
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Kho nhập:</div>
              <div className="text-sm">{importData.warehouseName}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Trạng thái:</div>
              <div className="text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    importData.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {importData.isApproved ? (
                    <span className="flex items-center">Hoàn thành</span>
                  ) : (
                    "Đang kiểm tra"
                  )}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="text-sm font-medium">Tổng số lượng:</div>
              <div className="text-sm">{importData.totalQuantity}</div>
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
              <div className="text-sm">{importData.supplier}</div>
            </div>
          </div>

          {!importData.isApproved && (
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
                  title={`${importData.totalPrice.toLocaleString()} đ`}
                >
                  {importData.totalPrice.toLocaleString()} VNĐ
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
          {importData.isApproved
            ? "Hàng đã được kiểm tra chất lượng và nhập kho thành công."
            : "Hàng đã được kiểm tra số lượng. Đang tiến hành kiểm tra chất lượng."}
        </p>
      </div>
    </div>
  );
}
