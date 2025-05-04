import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu, BarChart3, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Tổng quan",
    path: "/accountant/dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Xem lịch sử giao dịch",
    path: "/accountant/view-export/",
    icon: <Eye className="h-5 w-5" />,
  },
];

interface AccountantSidebarProps {
  collapsed?: boolean;
}

export function AccountantSidebar({
  collapsed = false,
}: AccountantSidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <div
      className={cn(
        "h-screen bg-slate-800 text-white p-4 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        {!isCollapsed && (
          <div className="text-xl font-bold">Quản lí giao dịch</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-slate-700 ml-auto"
        >
          {isCollapsed ? (
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
