// Product interface
export interface Product {
  productId: number;
  productCode: string;
  productName: string;
  unit: string;
  defaultExpiration: number;
  categoryId: number;
  description: string;
  taxId: number;
  createdBy: string;
  createdDate: string;
  createdByName: string;
  updatedByName: string;
  availableStock: number;
  price: number;
  images: string[];
}

// Warehouse inventory interface
export interface WarehouseInventory {
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  totalQuantity: number;
}
