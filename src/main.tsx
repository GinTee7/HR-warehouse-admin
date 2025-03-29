import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/layout";
import { ProtectedRoute } from "@/components/protected-route";
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={[1]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/accounts" replace />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="approve" element={<ApprovePage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* 404 for non-existent admin routes */}
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
            {/* 404 for non-existent warehouse routes */}
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
