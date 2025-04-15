import AddressMapper, {
  AddressIds,
  AddressNames,
} from "@/services/address-mapper";
import { useState } from "react";

/**
 * Hook để ánh xạ giữa ID và tên địa chỉ
 */
export function useAddressMapping() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Lấy tên địa chỉ từ ID
   */
  const getAddressNames = async (ids: AddressIds): Promise<AddressNames> => {
    setIsLoading(true);
    setError(null);

    try {
      const names = await AddressMapper.getAddressNames(ids);
      return names;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Lỗi không xác định khi lấy tên địa chỉ");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Lấy ID địa chỉ từ tên
   */
  const getAddressIds = async (names: AddressNames): Promise<AddressIds> => {
    setIsLoading(true);
    setError(null);

    try {
      const ids = await AddressMapper.getAddressIds(names);
      return ids;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Lỗi không xác định khi lấy ID địa chỉ");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getAddressNames,
    getAddressIds,
    isLoading,
    error,
  };
}

export default useAddressMapping;
