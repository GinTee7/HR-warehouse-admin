import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, FileText, User } from "lucide-react";
import type { Account, Contract } from "../services/account-services";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AccountDetailsDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDetailsDialog({
  account,
  open,
  onOpenChange,
}: AccountDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("info");

  if (!account) return null;

  const hasContracts = account.contracts && account.contracts.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            Chi tiết tài khoản: {account.username}
          </DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và hợp đồng của tài khoản
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin tài khoản</TabsTrigger>
            <TabsTrigger value="contracts" disabled={!hasContracts}>
              Hợp đồng{" "}
              {hasContracts && (
                <Badge variant="secondary" className="ml-2">
                  {account.contracts?.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid  gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Thông tin cơ bản
                  </h3>
                  <Separator className="my-2" />
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium">Tên người dùng:</dt>
                      <dd className="text-sm">{account.username}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium">Email:</dt>
                      <dd className="text-sm">{account.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium">Số điện thoại:</dt>
                      <dd className="text-sm">{account.phone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium">Loại tài khoản:</dt>
                      <dd className="text-sm">
                        {account.userType === "EMPLOYEE" ? (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            Nhân viên
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Đại lý
                          </Badge>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium">Trạng thái:</dt>
                      <dd className="text-sm">
                        {account.status ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Kích hoạt
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            Vô hiệu hóa
                          </Badge>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium">Email xác thực:</dt>
                      <dd className="text-sm">
                        {account.verifyEmail ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Đã xác thực
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Chưa xác thực
                          </Badge>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                {account.userType === "AGENCY" && account.agencyName && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Thông tin đại lý
                    </h3>
                    <Separator className="my-2" />
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium">Tên đại lý:</dt>
                        <dd className="text-sm">{account.agencyName}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {account.userType === "EMPLOYEE" && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Thông tin nhân viên
                    </h3>
                    <Separator className="my-2" />
                    <dl className="space-y-2">
                      {account.fullName && (
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium">Họ tên:</dt>
                          <dd className="text-sm">{account.fullName}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Thông tin địa chỉ
                </h3>
                <Separator className="my-2" />
                <div className="text-sm">
                  {account.address ? (
                    <p className="whitespace-pre-wrap">{account.address}</p>
                  ) : account.street ||
                    account.wardName ||
                    account.districtName ||
                    account.provinceName ? (
                    <p className="whitespace-pre-wrap">
                      {[
                        account.street,
                        account.wardName,
                        account.districtName,
                        account.provinceName,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">Chưa có thông tin</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4 pt-4">
            {hasContracts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {account.contracts?.map((contract) => (
                  <ContractCard key={contract.contractId} contract={contract} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">
                  Tài khoản này chưa có hợp đồng nào
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ContractCardProps {
  contract: Contract;
}

function ContractCard({ contract }: ContractCardProps) {
  const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) =>
    contract.fileType.toLowerCase().includes(ext)
  );

  const formattedDate = new Date(contract.createdAt).toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <div className="font-medium truncate" title={contract.fileName}>
          {contract.fileName}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(contract.filePath, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Xem
        </Button>
      </div>
      <div className="p-2">
        {isImage ? (
          <div className="relative h-48 w-full">
            <img
              src={contract.filePath || "/placeholder.svg"}
              alt={contract.fileName}
              className="object-contain w-full h-full"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center bg-gray-100">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="px-3 py-2 text-xs text-gray-500">
        Ngày tạo: {formattedDate}
      </div>
    </div>
  );
}
