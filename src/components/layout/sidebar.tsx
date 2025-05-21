"use client";

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Tổng quan",
    path: "/admin/dashboard",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Quản lí tài khoản",
    path: "/admin/accounts",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Xét duyệt tài khoản",
    path: "/admin/approve",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  // {
  //   title: "Trang cá nhân",
  //   path: "/admin/profile",
  //   icon: <User className="h-5 w-5" />,
  // },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-screen bg-slate-800 text-white transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-slate-700 py-4",
          collapsed ? "px-2 justify-between" : "px-4 justify-between"
        )}
      >
        {collapsed ? (
          <div className="flex items-center">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8" />
            <div className="text-xl font-bold">Admin Dashboard</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-slate-700 h-8 w-8"
        >
          {collapsed ? (
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
              collapsed && "justify-center px-2"
            )}
          >
            {item.icon}
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
