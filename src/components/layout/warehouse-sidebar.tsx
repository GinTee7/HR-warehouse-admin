"use client";

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Warehouse,
  PackagePlus,
  Eye,
  PackageSearch,
  Import,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Tổng quan",
    path: "/warehouse/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Kho hàng",
    path: "/warehouse/bunker",
    icon: <Warehouse className="h-5 w-5" />,
  },
  {
    title: "Nhập sản phẩm",
    path: "/warehouse/import",
    icon: <PackagePlus className="h-5 w-5" />,
  },
  {
    title: "Quản lí hàng",
    path: "/warehouse/inventory",
    icon: <Import className="h-5 w-5" />,
  },

  {
    title: "Xem đơn xuất kho",
    path: "/warehouse/view-export/",
    icon: <Eye className="h-5 w-5" />,
  },
  // {
  //   title: "Xuất sản phẩm",
  //   path: "/warehouse/export",
  //   icon: <PackageMinus className="h-5 w-5" />,
  // },
  // {
  //   title: "Duyệt đơn xuất kho",
  //   path: "/warehouse/export/approval",
  //   icon: <PackageCheck className="h-5 w-5" />,
  // },
  {
    title: "Yêu cầu điều phối",
    path: "/warehouse/transfer-request",
    icon: <PackageSearch className="h-5 w-5" />,
  },
  // {
  //   title: "Hồ sơ",
  //   path: "/warehouse/profile",
  //   icon: <User className="h-5 w-5" />,
  // },
];

interface WarehouseSidebarProps {
  collapsed?: boolean;
}

export function WarehouseSidebar({ collapsed = false }: WarehouseSidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <div
      className={cn(
        "h-screen bg-slate-800 text-white transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-slate-700 py-4",
          isCollapsed ? "px-2 justify-between" : "px-4 justify-between"
        )}
      >
        {isCollapsed ? (
          <div className="flex items-center">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8" />
            <div className="text-xl font-bold">Quản lý kho</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-slate-700 h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="md:hidden px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-slate-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="space-y-1 flex-1 px-2 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-slate-700",
              location.pathname === item.path
                ? "bg-slate-700 text-white"
                : "text-slate-200",
              isCollapsed && "justify-center px-2"
            )}
          >
            {item.icon}
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
