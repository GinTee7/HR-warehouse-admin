import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Users,
    Building,
    ClipboardList,
    MailWarning,
} from "lucide-react";

interface AccountDashboardData {
    totalAccounts: number;
    activeAccounts: number;
    inactiveAccounts: number;
    totalAgencies: number;
    totalSalesManagers: number;
    totalWarehouseManagers: number;
    totalRegisterAccounts: number;
    approvedRegisterAccounts: number;
    pendingRegisterAccounts: number;
    canceledRegisterAccounts: number;
    unverifiedEmailCount: number;
}


export function AccountOverview() {
    const [accountData, setAccountData] = useState<AccountDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);



    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token")
                const response = await fetch(
                    "https://minhlong.mlhr.org/api/admin/account-dashboard",
                    {

                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch account data: ${response.statusText}`);
                }

                const data: AccountDashboardData = await response.json();

                setAccountData(data);

            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An unknown error occurred"
                );
                console.error("Error fetching account data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatNumber = (value: number | undefined | null) => {
        if (value === undefined || value === null) return "N/A";
        return value.toLocaleString("vi-VN");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-sm">Đang tải dữ liệu tài khoản...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-sm text-destructive">Lỗi: {error}</div>
            </div>
        );
    }

    if (!accountData) {
        return null;
    }

    return (
        <>
            <Card className="bg-blue-50 border-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Tổng Số Tài Khoản
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatNumber(accountData.totalAccounts)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formatNumber(accountData.activeAccounts)} hoạt động •{" "}
                        {formatNumber(accountData.inactiveAccounts)} không hoạt động
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Tổng Số Đại Lý
                    </CardTitle>
                    <Building className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatNumber(accountData.totalAgencies)} Đại lý
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formatNumber(accountData.totalSalesManagers)} quản lý kinh doanh •{" "}
                        {formatNumber(accountData.totalWarehouseManagers)} quản lý kho
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Tài Khoản Đăng Ký
                    </CardTitle>
                    <ClipboardList className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatNumber(accountData.totalRegisterAccounts)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formatNumber(accountData.approvedRegisterAccounts)} đã duyệt •{" "}
                        {formatNumber(accountData.pendingRegisterAccounts)} đang chờ •{" "}
                        {formatNumber(accountData.canceledRegisterAccounts)} đã hủy
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Email Chưa Xác Thực
                    </CardTitle>
                    <MailWarning className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatNumber(accountData.unverifiedEmailCount)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Cần xác thực email
                    </p>
                </CardContent>
            </Card>
        </>
    );
} 