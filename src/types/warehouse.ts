// Interface for Product Details
export interface ProductDetails {
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

// Interface for Product in Transfer
export interface Product {
  productId: number;
  quantity: number;
  unit: string;
  notes: string;
  productDetails?: ProductDetails;
}

// Interface for Warehouse Transfer
export interface WarehouseTransfer {
  id: number;
  requestCode: string;
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  requestDate: string;
  status: string;
  notes: string;
  orderCode: string;
  products: Product[];
  sourceWarehouseName: string;
  destinationWarehouseName: string;
}

// Interface for Warehouse Information
export interface WarehouseInfo {
  warehouseId: number;
  warehouseName: string;
  fullAddress: string;
}
