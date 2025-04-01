import type { ReactNode } from "react";
import type { PendingAccount } from "../approve-page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountDetailDialogProps {
  account: PendingAccount;
  children: ReactNode;
}

export function AccountDetailDialog({
  account,
  children,
}: AccountDetailDialogProps) {
  const getFullAddress = () => {
    return [
      account.street,
      account.wardName,
      account.districtName,
      account.provinceName,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Chi tiết tài khoản</DialogTitle>
              <DialogDescription className="mt-1">
                Thông tin đăng ký của {account.fullName}
              </DialogDescription>
            </div>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-right font-medium text-gray-500">
              Username:
            </div>
            <div>{account.username}</div>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-right font-medium text-gray-500">Email:</div>
            <div>{account.email}</div>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-right font-medium text-gray-500">Họ tên:</div>
            <div>{account.fullName}</div>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-right font-medium text-gray-500">
              Loại tài khoản:
            </div>
            <div>
              {account.userType === "EMPLOYEE" ? "Nhân viên" : "Đại lý"}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-right font-medium text-gray-500">Vị trí:</div>
            <div>{account.position}</div>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-right font-medium text-gray-500">
              Phòng ban:
            </div>
            <div>{account.department}</div>
          </div>

          {account.userType === "AGENCY" && (
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <div className="text-right font-medium text-gray-500">
                Tên đại lý:
              </div>
              <div>{account.agencyName}</div>
            </div>
          )}

          <div className="grid grid-cols-[120px_1fr] gap-2">
            <div className="text-right font-medium text-gray-500">Địa chỉ:</div>
            <div>{getFullAddress()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
