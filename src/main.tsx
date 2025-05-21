import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AdminLayout } from "@/components/layout/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { toast } from "sonner"; // Đảm bảo sonner được import cho ProtectedLoginRoute
import "./index.css";
import AccountsPage from "./page/account/accounts-page";
import ApprovePage from "./page/approve/approve-page";
import ProfilePage from "./page/profile/profile-page";
import { Toaster } from "./components/ui/sonner";
import LoginPage from "./page/auth/login-page";
import NotFoundPage from "./page/not-found/not-found-page";
import ExportPage from "./page/ware-house/export/export-page";
import ImportPage from "./page/ware-house/import/import-page";
import WarehouseProfile from "./page/ware-house/proflie/warehouse-profile";
import WarehouseDashboard from "./page/ware-house/dashboard/warehouse-dashboard";
import { WarehouseLayout } from "./components/layout/warehouse-layout";
import InventoryPage from "./page/ware-house/inventory/inventory-page";
import ExportApprovalPage from "./page/ware-house/export-approve/export-approve-page";
import ViewExportPage from "./page/ware-house/view-export/view-export-page";
import SignalRListener from "./components/signalr/SignalRListener";
import PaymentHistoryPage from "./page/accountant/payment-history";
import { AccountantLayout } from "./components/layout/accountant-layout";
import WarehouseTransfersPage from "./page/ware-house/tranfers/page";

// Định nghĩa ProtectedLoginRoute trong cùng file hoặc import từ file riêng
const ProtectedLoginRoute = () => {
  const sessionToken = localStorage.getItem("token");
  const localToken = localStorage.getItem("token");
  const token = sessionToken || localToken;

  const sessionRole = localStorage.getItem("Role");
  const localRole = localStorage.getItem("Role");
  const userRole = sessionRole || localRole;

  if (token && userRole) {
    const roleNumber = Number(userRole);
    switch (roleNumber) {
      case 1:
        return <Navigate to="/admin" replace />;
      case 3: // Sửa từ 4 thành 3 để khớp với route warehouse
        return <Navigate to="/warehouse" replace />;
      case 5:
        return <Navigate to="/accountant" replace />;
      case 6:
        return <Navigate to="/planner" replace />;
      default:
        toast.error("Vai trò không hợp lệ, vui lòng đăng nhập lại");
        localStorage.clear();
        return <Outlet />;
    }
  }

  return <Outlet />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SignalRListener />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Bảo vệ trang login với ProtectedLoginRoute */}
        <Route element={<ProtectedLoginRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={[1]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/accounts" replace />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="approve" element={<ApprovePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Protected Warehouse Routes */}
        <Route element={<ProtectedRoute allowedRoles={[3]} />}>
          <Route path="/warehouse" element={<WarehouseLayout />}>
            <Route
              index
              element={<Navigate to="/warehouse/dashboard" replace />}
            />
            <Route path="dashboard" element={<WarehouseDashboard />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="import" element={<ImportPage />} />
            <Route path="profile" element={<WarehouseProfile />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="export/approval" element={<ExportApprovalPage />} />
            <Route path="view-export" element={<ViewExportPage />} />
            <Route
              path="transfer-request"
              element={<WarehouseTransfersPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Protected Accountant Routes */}
        <Route element={<ProtectedRoute allowedRoles={[5]} />}>
          <Route path="/accountant" element={<AccountantLayout />}>
            <Route
              index
              element={<Navigate to="/accountant/dashboard" replace />}
            />
            <Route path="dashboard" element={<PaymentHistoryPage />} />
            <Route path="profile" element={<WarehouseProfile />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* Global 404 route - must be the last route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    <Toaster position="top-center" richColors />
  </React.StrictMode>
);
