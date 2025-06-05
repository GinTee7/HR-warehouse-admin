import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileOutput, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import { ReturnRequestsList } from "./components/return-requests-list";
import { fetchReturnRequests } from "@/lib/return-api";
import type { ReturnWarehouseReceipt } from "@/types/warehouse";
import { ExportReceiptsList } from "./components/export-receipts-list";

export default function ViewExportPage() {
  const [activeTab, setActiveTab] = useState("export-receipts");
  const [returnRequests, setReturnRequests] = useState<
    ReturnWarehouseReceipt[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);

  useEffect(() => {
    // Get warehouse ID from session storage
    const storedWarehouseId = localStorage.getItem("warehouseId");
    if (storedWarehouseId) {
      setWarehouseId(Number.parseInt(storedWarehouseId, 10));
    } else {
      // For demo purposes, default to warehouse ID 1 if not found
      setWarehouseId(1);
      console.warn(
        "warehouseId not found in localStorage, using default value 1"
      );
    }
  }, []);

  useEffect(() => {
    if (warehouseId && activeTab === "return-requests") {
      loadReturnData(warehouseId);
    }
  }, [warehouseId, activeTab]);

  const loadReturnData = async (id: number) => {
    console.log(id);

    setIsLoading(true);
    try {
      const returns = await fetchReturnRequests();
      setReturnRequests(returns);
    } catch (error) {
      console.error("Error loading return data:", error);
      toast.error("Không thể tải dữ liệu phiếu trả hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnProcessed = () => {
    if (warehouseId) {
      loadReturnData(warehouseId);
    }
    toast.success("Đã xử lý yêu cầu trả hàng thành công");
  };

  return (
    <div className="space-y-6 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý xuất kho
          </h1>
        </div>
      </div>

      <Card>
        <CardContent>
          <Tabs
            defaultValue="export-receipts"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="export-receipts"
                className="flex items-center"
              >
                <FileOutput className="mr-2 h-4 w-4" />
                Phiếu xuất kho
              </TabsTrigger>
              <TabsTrigger
                value="return-requests"
                className="flex items-center"
              >
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Phiếu trả hàng
                {returnRequests.length > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                    {returnRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="export-receipts" className="mt-0">
              <ExportReceiptsList />
            </TabsContent>
            <TabsContent value="return-requests" className="mt-0">
              <ReturnRequestsList
                returnRequests={returnRequests}
                isLoading={isLoading}
                onRefresh={() => warehouseId && loadReturnData(warehouseId)}
                onProcessed={handleReturnProcessed}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
