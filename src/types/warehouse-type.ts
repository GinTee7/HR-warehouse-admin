export interface Warehouse {
  id?: string;
  warehouseId?: number;
  warehouseName: string;
  street: string;

  // Thông tin địa chỉ dạng ID
  wardId?: number;
  districtId?: number;
  provinceId?: number;

  // Thông tin địa chỉ dạng tên
  ward?: string;
  district?: string;
  province?: string;

  // Đối tượng address từ API
  address?: {
    addressId: number;
    street: string;
    wardId: number;
    districtId: number;
    provinceId: number;
  };

  note: string;
}

// Thêm interface cho dữ liệu địa chỉ từ API
export interface AddressResponse {
  addressId: number;
  street: string;
  wardId: number;
  districtId: number;
  provinceId: number;
}
