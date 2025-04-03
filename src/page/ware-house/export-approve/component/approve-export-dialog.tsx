import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
}

interface ApproveExportDialogProps {
  request: ExportRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (quantity: number) => void;
}

export function ApproveExportDialog({
  request,
  open,
  onOpenChange,
  onApprove,
}: ApproveExportDialogProps) {
  const [quantity, setQuantity] = useState(request.quantityRequested);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (isNaN(value) || value <= 0) {
      setQuantity(0);
      setError("Số lượng phải lớn hơn 0");
    } else if (value > request.quantityRequested) {
      setQuantity(request.quantityRequested);
      setError("Số lượng không thể vượt quá số lượng yêu cầu");
    } else {
      setQuantity(value);
      setError("");
    }
  };

  const handleSubmit = () => {
    if (quantity <= 0) {
      setError("Số lượng phải lớn hơn 0");
      return;
    }

    if (quantity > request.quantityRequested) {
      setError("Số lượng không thể vượt quá số lượng yêu cầu");
      return;
    }

    setIsSubmitting(true);
    try {
      onApprove(quantity);
    } catch (error) {
      console.error("Error approving request:", error);
      setError("Đã xảy ra lỗi khi duyệt yêu cầu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Duyệt yêu cầu xuất kho</DialogTitle>
          <DialogDescription>
            Xác nhận số lượng sản phẩm được duyệt xuất kho
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Sản phẩm:
            </Label>
            <div className="col-span-3 font-medium">{request.productName}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agency" className="text-right">
              Đại lý:
            </Label>
            <div className="col-span-3">{request.agencyName}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="requestedQuantity" className="text-right">
              SL yêu cầu:
            </Label>
            <div className="col-span-3 flex items-center">
              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
              {request.quantityRequested.toLocaleString()}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="approvedQuantity" className="text-right">
              SL duyệt:
            </Label>
            <div className="col-span-3">
              <Input
                id="approvedQuantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={request.quantityRequested}
                className="w-full"
              />
            </div>
          </div>

          {error && (
            <AlertDialog open={!!error}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Lỗi</AlertDialogTitle>
                  <AlertDialogDescription>{error}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button variant="outline" onClick={() => setError("")}>
                    Đóng
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || quantity <= 0}
          >
            {isSubmitting ? "Đang xử lý..." : "Duyệt yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
