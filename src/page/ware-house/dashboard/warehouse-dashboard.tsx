import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, PackageCheck, Truck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { WarehouseLocationDialog } from "../components/warehouse-location-dialog";
import { Warehouse } from "@/types/warehouse-type";
import warehouseService from "@/services/warehouse-service";
import vietnamLocationService from "@/services/vietnam-location-service";

export default function WarehouseDashboard() {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  // Removed unused isLoadingWarehouse state
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  // Fetch warehouse information on component mount
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        // Removed unused setIsLoadingWarehouse call
        const data = await warehouseService.getWarehouse();
        console.log("Warehouse data:", data);
        if (data?.warehouseId !== undefined) {
          localStorage.setItem("warehouseId", data.warehouseId.toString());
        }
        // Nếu có dữ liệu và có đối tượng address
        if (data && data.address) {
          // Cần lấy tên địa chỉ từ ID trong đối tượng address
          try {
            // Lấy tên tỉnh/thành phố
            const provinces = await vietnamLocationService.getProvinces();
            const province = provinces.find(
              (p) => p.provinceId === data.address?.provinceId
            );

            // Lấy tên quận/huyện
            const districts =
              await vietnamLocationService.getDistrictsByProvinceId(
                data.address.provinceId
              );
            const district = districts.find(
              (d) => d.districtId === data.address?.districtId
            );

            // Lấy tên phường/xã
            const wards = await vietnamLocationService.getWardsByDistrictId(
              data.address.districtId
            );
            const ward = wards.find((w) => w.wardId === data.address?.wardId);

            // Cập nhật dữ liệu với tên địa chỉ
            data.province = province?.provinceName || "Không xác định";
            data.district = district?.districtName || "Không xác định";
            data.ward = ward?.wardName || "Không xác định";
            data.street = data.address.street || "";
          } catch (error) {
            console.error("Error fetching location names:", error);
          }
        }

        setWarehouse(data);

        // If no warehouse data, open the location dialog and mark as initial setup
        if (!data) {
          setIsLocationDialogOpen(true);
          setIsInitialSetup(true);
        }
      } catch (error) {
        console.error("Error fetching warehouse:", error);
        toast.error("Không thể tải thông tin kho hàng");
      }
    };

    fetchWarehouse();
  }, []);

  const handleSaveWarehouse = async (warehouseData: Warehouse) => {
    try {
      if (warehouse?.id) {
        // Update existing warehouse - đảm bảo giữ lại các ID nếu có
        const updatedWarehouse = await warehouseService.updateWarehouse({
          ...warehouseData,
          id: warehouse.id,
          // Giữ lại các ID từ dữ liệu hiện tại nếu có
          provinceId: warehouse.provinceId || warehouseData.provinceId,
          districtId: warehouse.districtId || warehouseData.districtId,
          wardId: warehouse.wardId || warehouseData.wardId,
        });
        setWarehouse(updatedWarehouse);
        toast.success("Cập nhật thông tin kho hàng thành công");
      } else {
        // Create new warehouse
        const newWarehouse = await warehouseService.createWarehouse(
          warehouseData
        );
        setWarehouse(newWarehouse);
        setIsInitialSetup(false);
        toast.success("Thiết lập kho hàng thành công");
      }
    } catch (error) {
      console.error("Error saving warehouse:", error);
      toast.error("Không thể lưu thông tin kho hàng");
      throw error;
    }
  };

  // Nếu đang trong quá trình thiết lập ban đầu, chỉ hiển thị dialog
  if (isInitialSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <WarehouseLocationDialog
          open={isLocationDialogOpen}
          onOpenChange={(open) => {
            // Không cho phép đóng dialog trong quá trình thiết lập ban đầu
            if (isInitialSetup && !open) return;
            setIsLocationDialogOpen(open);
          }}
          onSave={handleSaveWarehouse}
          isInitialSetup={isInitialSetup}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Tổng quan kho hàng
        </h2>
      </div>

      {warehouse && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Thông tin kho hàng</CardTitle>
            <CardDescription>
              {warehouse.warehouseName}
              {warehouse.street &&
                warehouse.ward &&
                warehouse.district &&
                warehouse.province && (
                  <>
                    {" "}
                    - {warehouse.street}, {warehouse.ward}, {warehouse.district}
                    , {warehouse.province}
                  </>
                )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">
              +12% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nhập kho tháng này
            </CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">
              +4% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Xuất kho tháng này
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">289</div>
            <p className="text-xs text-muted-foreground">
              +18% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sản phẩm sắp hết
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Cần nhập thêm hàng</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Hoạt động xuất nhập kho</CardTitle>
            <CardDescription>
              Thống kê xuất nhập kho trong 30 ngày qua
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Biểu đồ xuất nhập kho
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sản phẩm phổ biến</CardTitle>
            <CardDescription>Top sản phẩm xuất kho nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-[46px] h-[46px] rounded bg-slate-100 mr-4 flex items-center justify-center">
                    <Package className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Sản phẩm {i}</p>
                    <p className="text-xs text-muted-foreground">
                      Mã SP: SP00{i}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {Math.floor(Math.random() * 100) + 50} xuất
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Location Dialog */}
      <WarehouseLocationDialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
        onSave={handleSaveWarehouse}
      />
    </div>
  );
}
