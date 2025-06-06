import { useState, useEffect } from "react";
import {
  Card,

  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { WarehouseLocationDialog } from "../components/warehouse-location-dialog";
import { Warehouse } from "@/types/warehouse-type";
import warehouseService from "@/services/warehouse-service";
import vietnamLocationService from "@/services/vietnam-location-service";
import { WarehouseReceiptChart } from "@/components/warehouse/warehouse-receipt-chart";
import { WarehouseProfitSummary } from "@/components/warehouse/warehouse-profit-summary";



export default function WarehouseDashboard() {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isInitialSetup, setIsInitialSetup] = useState(false);


  // Fetch warehouse information on component mount
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        // Removed unused setIsLoadingWarehouse call
        const data = await warehouseService.getWarehouse();
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
    <div className="space-y-6" style={{ maxHeight: "80vh", overflowY: "auto" }}>
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



      <div >
        <div className="mt-4">

          <WarehouseReceiptChart />
        </div>

        <div className="mt-4">
          <WarehouseProfitSummary />
        </div>
      </div>


    </div>
  );
}
