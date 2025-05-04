import type React from "react";

import { useState, useRef, useEffect } from "react";
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
import type { Account } from "../services/account-services";

// Custom dropdown menu components
interface CustomDropdownProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
}

function CustomDropdown({ children, trigger }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {children}
        </div>
      )}
    </div>
  );
}

interface CustomDropdownItemProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

function CustomDropdownItem({
  onClick,
  className,
  children,
}: CustomDropdownItemProps) {
  return (
    <div
      className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
        className || ""
      }`}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      {children}
    </div>
  );
}

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
      {/* Header của bảng */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-b py-3 px-4 text-sm font-medium text-gray-500">
        <div>Tên người dùng</div>
        <div className="hidden md:block">Email</div>
        <div className="hidden lg:block">Số điện thoại</div>
        <div className="hidden md:block">Loại tài khoản</div>
        <div className="hidden lg:block">Trạng thái</div>
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
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-center py-3 px-4 hover:bg-gray-50"
            >
              <div className="font-medium">{account.username}</div>
              <div className="text-gray-600 hidden md:block truncate">
                {account.email}
              </div>
              <div className="hidden lg:block">{account.phone}</div>
              <div className="hidden md:block">
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
              <div className="hidden lg:block">
                {account.status ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    Kích hoạt
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    Vô hiệu hóa
                  </span>
                )}
              </div>
              <div className="flex justify-end">
                <CustomDropdown
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  }
                >
                  <CustomDropdownItem
                    className="flex items-center"
                    onClick={() => onEdit(account)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </CustomDropdownItem>
                  <CustomDropdownItem
                    className="flex items-center text-red-600"
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
                  </CustomDropdownItem>
                </CustomDropdown>
              </div>
              {/* Hiển thị thông tin bổ sung trên màn hình nhỏ */}
              <div className="col-span-2 md:hidden text-sm text-gray-600 mt-2">
                <div>Email: {account.email}</div>
                <div>Số điện thoại: {account.phone}</div>
                <div>
                  Loại tài khoản:{" "}
                  {account.userType === "EMPLOYEE" ? "Nhân viên" : "Đại lý"}
                </div>
                <div>
                  Trạng thái: {account.status ? "Kích hoạt" : "Vô hiệu hóa"}
                </div>
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
