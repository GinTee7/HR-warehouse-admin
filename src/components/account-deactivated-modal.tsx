"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface AccountDeactivatedModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export function AccountDeactivatedModal({
  isOpen,
  onConfirm,
}: AccountDeactivatedModalProps) {
  // Force the dialog to stay open
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  // Prevent closing by setting open back to true if someone tries to close it
  useEffect(() => {
    if (isOpen && !open) {
      setOpen(true);
    }
  }, [isOpen, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevent closing with Escape key
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent closing by clicking outside
        onInteractOutside={(e) => e.preventDefault()} // Prevent any outside interactions
      >
        <DialogHeader>
          <DialogTitle className="text-center text-red-500">
            Tài khoản bị vô hiệu hóa
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            Tài khoản của bạn đã bị vô hiệu hóa vui lòng nhắn tin quản trị viên
            để mở tài khoản
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            variant="default"
            onClick={onConfirm}
            className="min-w-[120px]"
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
