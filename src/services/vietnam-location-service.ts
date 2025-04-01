import { Districts, Provinces, Wards } from "../types/location-type";
import axios from "axios";

interface ApiProvince {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  phone_code: string;
}

interface ApiDistrict {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  province_code: string;
}

interface ApiWard {
  code: string;
  name: string;
  division_type: string;
  codename: string;
  district_code: string;
}

export class VietnamLocationService {
  private static instance: VietnamLocationService;
  // Optional cache to prevent redundant API calls
  private provincesCache: Provinces[] | null = null;
  private districtsCache: Map<number, Districts[]> = new Map();
  private wardsCache: Map<number, Wards[]> = new Map();

  private constructor() {}

  public static getInstance(): VietnamLocationService {
    if (!VietnamLocationService.instance) {
      VietnamLocationService.instance = new VietnamLocationService();
    }
    return VietnamLocationService.instance;
  }

  /**
   * Get all provinces
   * @param useCache Whether to use cached data if available
   * @returns Promise with array of provinces
   */
  public async getProvinces(useCache = true): Promise<Provinces[]> {
    try {
      // Return cached data if available and requested
      if (useCache && this.provincesCache) {
        return this.provincesCache;
      }

      const response = await axios.get<ApiProvince[]>(
        "https://provinces.open-api.vn/api/p/"
      );

      // Map API response to our Provinces type
      const provinces: Provinces[] = response.data.map((province) => ({
        provinceId: parseInt(province.code),
        provinceName: province.name,
      }));

      // Store in cache for future use
      this.provincesCache = provinces;

      return provinces;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw new Error("Failed to fetch provinces. Please try again later.");
    }
  }

  /**
   * Get districts by province ID
   * @param provinceId The ID of the province
   * @param useCache Whether to use cached data if available
   * @returns Promise with districts data
   */
  public async getDistrictsByProvinceId(
    provinceId: number,
    useCache = true
  ): Promise<Districts[]> {
    try {
      // Return cached data if available and requested
      if (useCache && this.districtsCache.has(provinceId)) {
        return this.districtsCache.get(provinceId)!;
      }

      const response = await axios.get<{ districts: ApiDistrict[] }>(
        `https://provinces.open-api.vn/api/p/${provinceId}?depth=2`
      );

      // Map API response to our Districts type
      const districts: Districts[] = response.data.districts.map(
        (district) => ({
          districtId: parseInt(district.code),
          districtName: district.name,
          provinceId: provinceId,
        })
      );

      // Store in cache for future use
      this.districtsCache.set(provinceId, districts);

      return districts;
    } catch (error) {
      console.error(
        `Error fetching districts for province ${provinceId}:`,
        error
      );
      throw new Error("Failed to fetch districts. Please try again later.");
    }
  }

  /**
   * Get wards by district ID
   * @param districtId The ID of the district
   * @param useCache Whether to use cached data if available
   * @returns Promise with wards data
   */
  public async getWardsByDistrictId(
    districtId: number,
    useCache = true
  ): Promise<Wards[]> {
    try {
      // Return cached data if available and requested
      if (useCache && this.wardsCache.has(districtId)) {
        return this.wardsCache.get(districtId)!;
      }

      const response = await axios.get<{ wards: ApiWard[] }>(
        `https://provinces.open-api.vn/api/d/${districtId}?depth=2`
      );

      // Map API response to our Wards type
      const wards: Wards[] = response.data.wards.map((ward) => ({
        wardId: parseInt(ward.code),
        wardName: ward.name,
        districtId: districtId,
      }));

      // Store in cache for future use
      this.wardsCache.set(districtId, wards);

      return wards;
    } catch (error) {
      console.error(`Error fetching wards for district ${districtId}:`, error);
      throw new Error("Failed to fetch wards. Please try again later.");
    }
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.provincesCache = null;
    this.districtsCache.clear();
    this.wardsCache.clear();
  }
}

export default VietnamLocationService.getInstance();
