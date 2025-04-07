import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { useState, useEffect } from "react";
import { useMediaQuery } from "../hooks/use-media-query";
import { WarehouseSidebar } from "./warehouse-sidebar";

export function WarehouseLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <WarehouseSidebar collapsed={!sidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
