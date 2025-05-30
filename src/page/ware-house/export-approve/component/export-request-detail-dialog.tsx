import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface ExportRequestDetail {
  warehouseRequestExportId: number;
  requestExportId: number;
  productId: number;
  quantityRequested: number;
  remainingQuantity: number;
  productName: string;
  status: string;
}

interface ExportRequestDetailDialogProps {
  warehouseRequestExportId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportRequestDetailDialog({
  warehouseRequestExportId,
  open,
  onOpenChange,
}: ExportRequestDetailDialogProps) {
  const [requestDetail, setRequestDetail] =
    useState<ExportRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCoordinationForm, setShowCoordinationForm] = useState(false);
  const [coordinationData, setCoordinationData] = useState({
    requestExportId: 0,
    destinationWarehouseId: 0,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const warehouseId = localStorage.getItem("warehouseId") || "1";
  const API_URL = import.meta.env.VITE_API_URL || "https://minhlong.mlhr.org";

  // Fetch export request detail
  useEffect(() => {
    if (open && warehouseRequestExportId) {
      fetchRequestDetail();
    }
  }, [open, warehouseRequestExportId]);

  // Set the destination warehouse ID from session storage
  useEffect(() => {
    if (requestDetail) {
      setCoordinationData({
        requestExportId: requestDetail.requestExportId,
        destinationWarehouseId: Number.parseInt(warehouseId),
        notes: "",
      });
    }
  }, [requestDetail, warehouseId]);

  const fetchRequestDetail = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}WarehouseRequestExport/${warehouseRequestExportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestDetail(response.data);
    } catch (error) {
      console.error("Error fetching export request detail:", error);
      toast.error("Không thể tải thông tin chi tiết yêu cầu xuất kho");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoordination = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}WarehouseTransfer/auto-create-from-remaining`,
        coordinationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Tạo yêu cầu điều phối thành công");
        onOpenChange(false);
      } else {
        throw new Error("Không thể tạo yêu cầu điều phối");
      }
    } catch (error) {
      console.error("Error creating coordination request:", error);
      toast.error("Không thể tạo yêu cầu điều phối. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu xuất kho</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về yêu cầu xuất kho
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">Đang tải...</span>
          </div>
        ) : requestDetail ? (
          <>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Mã yêu cầu:</Label>
                <div className="col-span-3 font-medium">
                  {requestDetail.requestExportId}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Sản phẩm:</Label>
                <div className="col-span-3 font-medium">
                  {requestDetail.productName}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Mã sản phẩm:</Label>
                <div className="col-span-3">{requestDetail.productId}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">SL yêu cầu:</Label>
                <div className="col-span-3 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                  {requestDetail.quantityRequested.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">SL còn lại:</Label>
                <div className="col-span-3 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                  {requestDetail.remainingQuantity.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Trạng thái:</Label>
                <div className="col-span-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      requestDetail.status.toLowerCase() === "approved"
                        ? "bg-green-100 text-green-800"
                        : requestDetail.status.toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {requestDetail.status === "APPROVED"
                      ? "Đã duyệt"
                      : requestDetail.status === "PENDING"
                      ? "Chờ duyệt"
                      : requestDetail.status === "REJECTED"
                      ? "Từ chối"
                      : requestDetail.status}
                  </span>
                </div>
              </div>
            </div>

            {!showCoordinationForm ? (
              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Đóng
                </Button>
                {(requestDetail?.status === "APPROVED" &&
                  requestDetail.remainingQuantity > 0) ||
                requestDetail?.status === "PENDING" ||
                requestDetail?.status === "Chờ duyệt" ? (
                  <Button onClick={() => setShowCoordinationForm(true)}>
                    Tạo yêu cầu điều phối
                  </Button>
                ) : null}
              </DialogFooter>
            ) : (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-4">Tạo yêu cầu điều phối</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="notes" className="text-right pt-2">
                        Ghi chú:
                      </Label>
                      <div className="col-span-3">
                        <Textarea
                          id="notes"
                          value={coordinationData.notes}
                          onChange={(e) =>
                            setCoordinationData({
                              ...coordinationData,
                              notes: e.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Nhập ghi chú cho yêu cầu điều phối"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCoordinationForm(false)}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </Button>
                  <Button
                    onClick={handleCreateCoordination}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Tạo yêu cầu"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Không tìm thấy thông tin chi tiết
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
