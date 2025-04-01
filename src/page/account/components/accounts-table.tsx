"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Account } from "../services/account-services";

interface AccountsTableProps {
  accounts: Account[];
  loading: boolean;
  onDelete: (userId: string | number) => void;
  onToggleStatus: (userId: string | number, currentStatus: boolean) => void;
  onEdit: (account: Account) => void;
}

export function AccountsTable({
  accounts,
  loading,
  onDelete,
  onToggleStatus,
  onEdit,
}: AccountsTableProps) {
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const confirmDelete = () => {
    if (accountToDelete) {
      onDelete(accountToDelete.userId);
      setAccountToDelete(null);
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <div className="grid grid-cols-6 border-b py-3 px-4 text-sm font-medium text-gray-500">
        <div>Tên người dùng</div>
        <div>Email</div>
        <div>Số điện thoại</div>
        <div>Loại tài khoản</div>
        <div>Trạng thái</div>
        <div className="text-right">Thao tác</div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-500">Đang tải...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-12 text-center text-gray-500">Không có dữ liệu</div>
      ) : (
        <div className="divide-y">
          {accounts.map((account) => (
            <div
              key={account.userId}
              className="grid grid-cols-6 items-center py-3 px-4 hover:bg-gray-50"
            >
              <div className="font-medium">{account.username}</div>
              <div className="text-gray-600">{account.email}</div>
              <div>{account.phone}</div>
              <div>
                {account.userType === "EMPLOYEE" ? (
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                    Nhân viên
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    Đại lý
                  </span>
                )}
              </div>
              <div>
                {account.status ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="flex items-center cursor-pointer"
                      onClick={() => onEdit(account)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center  text-red-600 cursor-pointer"
                      onClick={() =>
                        onToggleStatus(account.userId, account.status)
                      }
                    >
                      {account.status ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Vô hiệu hóa
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Kích hoạt
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!accountToDelete}
        onOpenChange={(open) => !open && setAccountToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản{" "}
              <span className="font-bold">{accountToDelete?.username}</span>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAccountToDelete(null)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
