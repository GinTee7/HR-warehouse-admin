// Export Request interface
export interface ExportRequest {
  warehouseRequestExportId: number;
  requestExportId: number;
  productId: number;
  quantityRequested: number;
  remainingQuantity: number;
  productName: string;
  approvedByFullName: string;
  orderCode: string;
  agencyName: string;
  status: string;
  discount: number;
  finalPrice: number;
}

// Grouped export requests by requestExportId
export interface GroupedExportRequest {
  requestExportId: number;
  orderCode: string;
  agencyName: string;
  products: {
    productName: string;
    remainingQuantity: number;
  }[];
}
export interface ExportReceiptDetail {
  warehouseProductId: number;
  productId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  totalProductAmount: number;
  expiryDate: string;
  discount: number;
  finalPrice: number;
}

export interface ExportReceipt {
  exportWarehouseReceiptId: number;
  documentNumber: string;
  documentDate: string;
  exportDate: string;
  exportType: string;
  totalQuantity: number;
  totalAmount: number;
  status: string;
  warehouseId: number;
  requestExportId: number;
  orderCode: string;
  agencyName: string;
  details: ExportReceiptDetail[];
  warehouseName: string;
  discount: number;
  finalPrice: number;
}
