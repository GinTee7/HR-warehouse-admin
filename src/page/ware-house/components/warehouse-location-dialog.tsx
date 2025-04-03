import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Warehouse } from "@/types/warehouse-type";
import { Districts, Provinces, Wards } from "@/types/location-type";
import vietnamLocationService from "@/services/vietnam-location-service";

// Thêm prop isInitialSetup để xác định đây là lần thiết lập đầu tiên
interface WarehouseLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (warehouseData: Warehouse) => Promise<void>;
  isInitialSetup?: boolean;
}

export function WarehouseLocationDialog({
  open,
  onOpenChange,
  onSave,
}: WarehouseLocationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [provinces, setProvinces] = useState<Provinces[]>([]);
  const [districts, setDistricts] = useState<Districts[]>([]);
  const [wards, setWards] = useState<Wards[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const [formData, setFormData] = useState<Warehouse>({
    warehouseName: "",
    street: "",
    ward: "",
    district: "",
    province: "",
    note: "",
  });

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );

  // Thêm state để lưu trữ dữ liệu địa chỉ ban đầu
  const [initialAddressData] = useState<{
    provinceId?: number;
    districtId?: number;
    wardId?: number;
  } | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        warehouseName: "",
        street: "",
        ward: "",
        district: "",
        province: "",
        note: "",
      });
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
    }
  }, [open]);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setIsLoadingProvinces(true);
        const data = await vietnamLocationService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to load provinces:", error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    if (open) {
      loadProvinces();
    }
  }, [open]);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!selectedProvinceId) return;

      try {
        setIsLoadingDistricts(true);
        setDistricts([]);
        setWards([]);
        setSelectedDistrictId(null);

        // Update form data with selected province name
        const selectedProvince = provinces.find(
          (p) => p.provinceId === selectedProvinceId
        );
        if (selectedProvince) {
          setFormData((prev) => ({
            ...prev,
            province: selectedProvince.provinceName,
            district: "",
            ward: "",
          }));
        }

        const data = await vietnamLocationService.getDistrictsByProvinceId(
          selectedProvinceId
        );
        setDistricts(data);
      } catch (error) {
        console.error("Failed to load districts:", error);
      } finally {
        setIsLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [selectedProvinceId, provinces]);

  // Load wards when district changes
  useEffect(() => {
    const loadWards = async () => {
      if (!selectedDistrictId) return;

      try {
        setIsLoadingWards(true);
        setWards([]);

        // Update form data with selected district name
        const selectedDistrict = districts.find(
          (d) => d.districtId === selectedDistrictId
        );
        if (selectedDistrict) {
          setFormData((prev) => ({
            ...prev,
            district: selectedDistrict.districtName,
            ward: "",
          }));
        }

        const data = await vietnamLocationService.getWardsByDistrictId(
          selectedDistrictId
        );
        setWards(data);
      } catch (error) {
        console.error("Failed to load wards:", error);
      } finally {
        setIsLoadingWards(false);
      }
    };

    loadWards();
  }, [selectedDistrictId, districts]);

  // Thêm useEffect để xử lý khi có dữ liệu địa chỉ ban đầu
  useEffect(() => {
    // Nếu có dữ liệu địa chỉ ban đầu và dialog đang mở
    if (initialAddressData && open) {
      const { provinceId, districtId } = initialAddressData;

      // Nếu có provinceId, load tỉnh/thành phố và cập nhật selected
      if (provinceId) {
        setSelectedProvinceId(provinceId);

        // Nếu có districtId, load quận/huyện và cập nhật selected
        if (districtId) {
          setSelectedDistrictId(districtId);
        }
      }
    }
  }, [initialAddressData, open]);

  // Thêm hàm để load tên địa chỉ từ ID
  // Removed unused loadLocationNames function to resolve the error

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cập nhật hàm handleWardChange để lưu tên thay vì ID
  const handleWardChange = (wardId: string) => {
    const selectedWard = wards.find(
      (w) => w.wardId === Number.parseInt(wardId)
    );
    if (selectedWard) {
      setFormData((prev) => ({
        ...prev,
        ward: selectedWard.wardName,
      }));
    }
  };

  // Cập nhật hàm handleSubmit để xử lý cấu trúc dữ liệu mới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.warehouseName ||
      !formData.province ||
      !formData.district ||
      !formData.ward ||
      !formData.street
    ) {
      alert("Vui lòng điền đầy đủ thông tin kho hàng");
      return;
    }

    setIsLoading(true);
    try {
      // Tạo đối tượng address để gửi lên API
      const warehouseDataWithAddress = {
        ...formData,
        address: {
          addressId: 0, // Provide a default or actual addressId value
          street: formData.street,
          provinceId: selectedProvinceId || 0, // Ensure non-null values
          districtId: selectedDistrictId || 0,
          wardId: wards.find((w) => w.wardName === formData.ward)?.wardId || 0,
        },
      };

      await onSave(warehouseDataWithAddress);
      window.location.reload();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving warehouse:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Nếu đang cố gắng đóng dialog (newOpen = false)
        if (!newOpen) {
          // Kiểm tra xem đã có dữ liệu kho hàng chưa
          // Nếu chưa có, không cho phép đóng dialog
          if (
            !formData.warehouseName ||
            !formData.province ||
            !formData.district ||
            !formData.ward ||
            !formData.street
          ) {
            // Không thay đổi trạng thái mở của dialog
            return;
          }
        }
        // Nếu đã có đủ dữ liệu hoặc đang mở dialog, cho phép thay đổi trạng thái
        onOpenChange(newOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          // Ngăn chặn tương tác bên ngoài dialog để đóng nó
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Ngăn chặn phím Escape để đóng dialog
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Thiết lập thông tin kho hàng</DialogTitle>
          <DialogDescription>
            Vui lòng cung cấp thông tin kho hàng để tiếp tục sử dụng hệ thống
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="warehouseName">
              Tên kho hàng <span className="text-red-500">*</span>
            </Label>
            <Input
              id="warehouseName"
              name="warehouseName"
              placeholder="Nhập tên kho hàng"
              value={formData.warehouseName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedProvinceId?.toString() || ""}
              onValueChange={(value) =>
                setSelectedProvinceId(Number.parseInt(value))
              }
              disabled={isLoadingProvinces}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingProvinces ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Đang tải...</span>
                  </div>
                ) : (
                  provinces.map((province) => (
                    <SelectItem
                      key={province.provinceId}
                      value={province.provinceId.toString()}
                    >
                      {province.provinceName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">
              Quận/Huyện <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedDistrictId?.toString() || ""}
              onValueChange={(value) =>
                setSelectedDistrictId(Number.parseInt(value))
              }
              disabled={isLoadingDistricts || !selectedProvinceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn quận/huyện" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingDistricts ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Đang tải...</span>
                  </div>
                ) : !selectedProvinceId ? (
                  <div className="py-2 px-2 text-sm text-muted-foreground">
                    Vui lòng chọn tỉnh/thành phố trước
                  </div>
                ) : districts.length === 0 ? (
                  <div className="py-2 px-2 text-sm text-muted-foreground">
                    Không có dữ liệu
                  </div>
                ) : (
                  districts.map((district) => (
                    <SelectItem
                      key={district.districtId}
                      value={district.districtId.toString()}
                    >
                      {district.districtName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ward">
              Phường/Xã <span className="text-red-500">*</span>
            </Label>
            <Select
              value={
                formData.ward
                  ? wards
                      .find((w) => w.wardName === formData.ward)
                      ?.wardId.toString() || ""
                  : ""
              }
              onValueChange={handleWardChange}
              disabled={isLoadingWards || !selectedDistrictId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phường/xã" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingWards ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Đang tải...</span>
                  </div>
                ) : !selectedDistrictId ? (
                  <div className="py-2 px-2 text-sm text-muted-foreground">
                    Vui lòng chọn quận/huyện trước
                  </div>
                ) : wards.length === 0 ? (
                  <div className="py-2 px-2 text-sm text-muted-foreground">
                    Không có dữ liệu
                  </div>
                ) : (
                  wards.map((ward) => (
                    <SelectItem
                      key={ward.wardId}
                      value={ward.wardId.toString()}
                    >
                      {ward.wardName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">
              Số nhà, đường <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              name="street"
              placeholder="Nhập số nhà, tên đường"
              value={formData.street}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Nhập ghi chú (nếu có)"
              value={formData.note}
              onChange={handleInputChange}
              className="min-h-[80px]"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thông tin"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
