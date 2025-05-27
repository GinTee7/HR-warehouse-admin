/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ApproveExportDialogProps {
  request: any;
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

  const handleApprove = () => {
    onApprove(Number.parseInt(quantity));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Duyệt yêu cầu xuất kho</DialogTitle>
          <DialogDescription>
            Nhập số lượng cần duyệt cho sản phẩm {request.productName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Số lượng:
            </Label>
            <Input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="col-span-3"
              min="1"
              max={request.quantityRequested}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="submit" onClick={handleApprove}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Duyệt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
