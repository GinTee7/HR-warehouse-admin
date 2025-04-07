import type React from "react";

import { useState, useEffect } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Menu, Settings, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

// Định nghĩa kiểu dữ liệu cho user
interface UserData {
  userId: string;
  username: string;
  email: string;
  password: string;
  userType: string;
  phone: string;
  status: boolean;
  verifyEmail: boolean;
}

// Button component tương thích với Radix
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) => {
  const baseClass =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy thông tin người dùng khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy userId từ sessionStorage
        const userId = sessionStorage.getItem("userId");

        if (userId) {
          const response = await axios.get(
            `https://minhlong.mlhr.org/api/user/${userId}`
          );
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      sessionStorage.clear();
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Đăng xuất thất bại");
    }
  };

  // Lấy chữ cái đầu của username cho avatar fallback
  const getInitials = () => {
    if (userData?.username) {
      return userData.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Lấy màu dựa trên userType
  const getUserTypeColor = () => {
    switch (userData?.userType) {
      case "ADMIN":
        return "bg-red-500 text-white";
      case "EMPLOYEE":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-white shadow-sm">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden cursor-pointer"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="relative h-10 w-10 rounded-full cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                type="button"
              >
                {loading ? (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  </div>
                ) : (
                  <Avatar.Root className="h-10 w-10 rounded-full">
                    <Avatar.Image
                      src="/placeholder.svg"
                      alt={userData?.username || "User"}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                    <Avatar.Fallback
                      className={`flex h-full w-full items-center justify-center rounded-full ${getUserTypeColor()}`}
                    >
                      {getInitials()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[250px] rounded-md border bg-white p-1 shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-50"
                align="end"
                sideOffset={5}
              >
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">Đang tải...</span>
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <Avatar.Root className="h-10 w-10 rounded-full">
                          <Avatar.Fallback
                            className={`flex h-full w-full items-center justify-center rounded-full ${getUserTypeColor()}`}
                          >
                            {getInitials()}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <div>
                          <p className="text-sm font-medium">
                            {userData?.username || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {userData?.email || "user@example.com"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getUserTypeColor()}`}
                        >
                          {userData?.userType || "USER"}
                        </span>
                        {userData?.status && (
                          <span className="inline-block ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Đang hoạt động
                          </span>
                        )}
                      </div>
                      {userData?.phone && (
                        <p className="mt-1 text-xs text-gray-500">
                          SĐT: {userData.phone}
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <DropdownMenu.Item
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                        onSelect={() => console.log("Profile clicked")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Hồ sơ</span>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                        onSelect={() => console.log("Settings clicked")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Cài đặt</span>
                      </DropdownMenu.Item>
                    </div>

                    <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />

                    <DropdownMenu.Item
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-red-500 hover:bg-red-50 focus:bg-red-50"
                      onSelect={() => setShowLogoutConfirm(true)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog.Root
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-md border bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <AlertDialog.Title className="text-lg font-semibold">
              Xác nhận đăng xuất
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-500">
              Bạn có chắc muốn đăng xuất khỏi hệ thống?
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 ring-offset-white transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  type="button"
                >
                  Hủy
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  onClick={handleLogout}
                  type="button"
                >
                  Đăng xuất
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </header>
  );
}
