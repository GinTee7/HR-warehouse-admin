export interface Provinces {
  provinceId: number;
  provinceName: string;
}
export interface Districts {
  districtId: number;
  districtName: string;
  provinceId: number;
}
export interface Wards {
  wardId: number;
  wardName: string;
  districtId: number;
}
