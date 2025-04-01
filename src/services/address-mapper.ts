/**
 * Utility service để ánh xạ giữa ID và tên địa chỉ
 */
import vietnamLocationService from "./vietnam-location-service";
import type { Provinces, Districts, Wards } from "../types/location-type";

export interface AddressIds {
  provinceId?: number;
  districtId?: number;
  wardId?: number;
}

export interface AddressNames {
  province?: string;
  district?: string;
  ward?: string;
}

export class AddressMapper {
  // Cache để lưu trữ dữ liệu đã lấy
  private static provincesCache: Provinces[] | null = null;
  private static districtsCache: Map<number, Districts[]> = new Map();
  private static wardsCache: Map<number, Wards[]> = new Map();

  /**
   * Lấy tên địa chỉ từ ID
   */
  public static async getAddressNames(ids: AddressIds): Promise<AddressNames> {
    const result: AddressNames = {};

    try {
      // Lấy tên tỉnh/thành phố
      if (ids.provinceId) {
        // Lấy danh sách tỉnh/thành phố nếu chưa có trong cache
        if (!this.provincesCache) {
          this.provincesCache = await vietnamLocationService.getProvinces();
        }

        const province = this.provincesCache.find(
          (p) => p.provinceId === ids.provinceId
        );
        if (province) {
          result.province = province.provinceName;
        }

        // Lấy tên quận/huyện
        if (ids.districtId) {
          // Lấy danh sách quận/huyện nếu chưa có trong cache
          if (!this.districtsCache.has(ids.provinceId)) {
            const districts =
              await vietnamLocationService.getDistrictsByProvinceId(
                ids.provinceId
              );
            this.districtsCache.set(ids.provinceId, districts);
          }

          const districts = this.districtsCache.get(ids.provinceId);
          const district = districts?.find(
            (d) => d.districtId === ids.districtId
          );
          if (district) {
            result.district = district.districtName;
          }

          // Lấy tên phường/xã
          if (ids.wardId) {
            // Lấy danh sách phường/xã nếu chưa có trong cache
            if (!this.wardsCache.has(ids.districtId)) {
              const wards = await vietnamLocationService.getWardsByDistrictId(
                ids.districtId
              );
              this.wardsCache.set(ids.districtId, wards);
            }

            const wards = this.wardsCache.get(ids.districtId);
            const ward = wards?.find((w) => w.wardId === ids.wardId);
            if (ward) {
              result.ward = ward.wardName;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error mapping address IDs to names:", error);
    }

    return result;
  }

  /**
   * Lấy ID địa chỉ từ tên
   */
  public static async getAddressIds(names: AddressNames): Promise<AddressIds> {
    const result: AddressIds = {};

    try {
      // Lấy ID tỉnh/thành phố
      if (names.province) {
        // Lấy danh sách tỉnh/thành phố nếu chưa có trong cache
        if (!this.provincesCache) {
          this.provincesCache = await vietnamLocationService.getProvinces();
        }

        const province = this.provincesCache.find(
          (p) => p.provinceName === names.province
        );
        if (province) {
          result.provinceId = province.provinceId;

          // Lấy ID quận/huyện
          if (names.district && result.provinceId) {
            // Lấy danh sách quận/huyện nếu chưa có trong cache
            if (!this.districtsCache.has(result.provinceId)) {
              const districts =
                await vietnamLocationService.getDistrictsByProvinceId(
                  result.provinceId
                );
              this.districtsCache.set(result.provinceId, districts);
            }

            const districts = this.districtsCache.get(result.provinceId);
            const district = districts?.find(
              (d) => d.districtName === names.district
            );
            if (district) {
              result.districtId = district.districtId;

              // Lấy ID phường/xã
              if (names.ward && result.districtId) {
                // Lấy danh sách phường/xã nếu chưa có trong cache
                if (!this.wardsCache.has(result.districtId)) {
                  const wards =
                    await vietnamLocationService.getWardsByDistrictId(
                      result.districtId
                    );
                  this.wardsCache.set(result.districtId, wards);
                }

                const wards = this.wardsCache.get(result.districtId);
                const ward = wards?.find((w) => w.wardName === names.ward);
                if (ward) {
                  result.wardId = ward.wardId;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error mapping address names to IDs:", error);
    }

    return result;
  }

  /**
   * Xóa cache
   */
  public static clearCache(): void {
    this.provincesCache = null;
    this.districtsCache.clear();
    this.wardsCache.clear();
  }
}

export default AddressMapper;
