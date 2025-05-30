"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { PendingAccount } from "../approve-page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, CheckCircle2, XCircle, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Contract {
  contractId: number;
  fileName: string;
  filePath: string;
  fileType: string;
  createdAt: string;
}

interface AccountDetailDialogProps {
  account: PendingAccount;
  children: ReactNode;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export function AccountDetailDialog({
  account,
  children,
  onApprove,
  onReject,
}: AccountDetailDialogProps) {
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleViewImage = (url: string) => {
    setSelectedImageUrl(url);
    setIsImageViewOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      console.log(error);

      return dateString;
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">
                  Chi tiết tài khoản
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Thông tin đăng ký của {account.username}
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

          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
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
              <div className="text-right font-medium text-gray-500">
                Họ tên:
              </div>
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
              <div className="text-right font-medium text-gray-500">
                Vị trí:
              </div>
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
              <div className="text-right font-medium text-gray-500">
                Địa chỉ:
              </div>
              <div>{getFullAddress()}</div>
            </div>

            {/* Contracts section */}
            {account.contracts && account.contracts.length > 0 && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">Hợp đồng</h3>
                  <div className="space-y-2">
                    {account.contracts.map((contract: Contract) => (
                      <div
                        key={contract.contractId}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <div className="font-medium">
                              {contract.fileName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(contract.createdAt)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewImage(contract.filePath)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {account.accountRegisterStatus === "Pending" && (
            <DialogFooter className="border-t pt-4">
              <div className="flex justify-end space-x-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 border-red-200"
                  onClick={() => {
                    onReject(account.registerId);
                    setIsDialogOpen(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Từ chối
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 border-green-200"
                  onClick={() => {
                    onApprove(account.registerId);
                    setIsDialogOpen(false);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Duyệt
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Image viewer dialog */}
      <Dialog open={isImageViewOpen} onOpenChange={setIsImageViewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
              onClick={() => setIsImageViewOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center max-h-[90vh] overflow-auto p-1">
              <img
                src={selectedImageUrl || "/placeholder.svg"}
                alt="Contract"
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
