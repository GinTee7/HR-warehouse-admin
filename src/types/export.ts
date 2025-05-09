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
