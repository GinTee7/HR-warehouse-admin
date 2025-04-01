import { useState, useEffect } from "react";
import { approveService } from "./services/approve-service";
import { ApproveHeader } from "./components/approve-header";
import { ApproveTable } from "./components/approve-table";
import { toast } from "sonner";

export interface PendingAccount {
  registerId: number;
  username: string;
  email: string;
  phone: string;
  userType: "EMPLOYEE" | "AGENCY";
  fullName: string;
  position: string;
  department: string;
  agencyName: string;
  street: string;
  wardName: string;
  districtName: string;
  provinceName: string;
  isApproved: boolean;
  accountRegisterStatus: string;
}

export default function ApprovePage() {
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingAccounts = async () => {
    setLoading(true);
    try {
      const response = await approveService.getPendingAccounts();

      // Filter accounts that are not approved
      const notApprovedAccounts = response.filter(
        (account) => account.accountRegisterStatus === "Pending"
      );

      setPendingAccounts(notApprovedAccounts);
    } catch (error) {
      console.error("Error fetching pending accounts:", error);
      toast.error("Không thể tải danh sách tài khoản chờ duyệt");
      setPendingAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await approveService.approveAccount(id);
      toast.success("Tài khoản đã được phê duyệt");
      fetchPendingAccounts();
    } catch (error) {
      console.error("Error approving account:", error);
      toast.error("Không thể phê duyệt tài khoản");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await approveService.rejectAccount(id);
      toast.error("Tài khoản đã bị từ chối");
      fetchPendingAccounts(); // Re-fetch accounts after rejection
    } catch (error) {
      console.error("Error rejecting account:", error);
      toast.error("Không thể từ chối tài khoản");
    }
  };

  return (
    <div className="space-y-4">
      <ApproveHeader />

      <ApproveTable
        accounts={pendingAccounts}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
