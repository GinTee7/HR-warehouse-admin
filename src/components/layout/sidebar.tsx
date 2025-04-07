import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  CheckSquare,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Quản lí Account",
    path: "/admin/accounts",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Xét duyệt Account",
    path: "/admin/approve",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    title: "Profile",
    path: "/admin/profile",
    icon: <User className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-screen bg-slate-800 text-white p-4 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        {!collapsed && <div className="text-xl font-bold">Admin Dashboard</div>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-slate-700 ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="md:hidden mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-slate-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="space-y-1 flex-1">
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
