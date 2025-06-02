import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import type { WarehouseTransfer } from "@/types/warehouse";
import {
  fetchIncomingTransfers,
  fetchOutgoingTransfers,
} from "@/lib/transfer-api";
import { OutgoingTransfers } from "./component/outgoing-transfers";
import { IncomingTransfers } from "./component/incoming-transfers";
import { connection } from "@/lib/signalr-client";

export default function WarehouseTransfersPage() {
  const [activeTab, setActiveTab] = useState("outgoing");
  const [outgoingTransfers, setOutgoingTransfers] = useState<
    WarehouseTransfer[]
  >([]);
  const [incomingTransfers, setIncomingTransfers] = useState<
    WarehouseTransfer[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);

  useEffect(() => {
    // Get warehouse ID from session storage
    const storedWarehouseId = localStorage.getItem("warehouseId");
    if (storedWarehouseId) {
      setWarehouseId(Number.parseInt(storedWarehouseId, 10));
    } else {
      setWarehouseId(1);
      console.warn(
        "warehouseId not found in localStorage, using default value 1"
      );
    }
  }, []);

  useEffect(() => {
    if (warehouseId) {
      loadTransferData(warehouseId);
    }
  }, [warehouseId]);

  const loadTransferData = async (id: number) => {
    setIsLoading(true);
    try {
      const [outgoing, incoming] = await Promise.all([
        fetchOutgoingTransfers(id),
        fetchIncomingTransfers(id),
      ]);
      setOutgoingTransfers(outgoing);
      setIncomingTransfers(incoming);
    } catch (error) {
      console.error("Error loading transfer data:", error);
      toast.error("Không thể tải dữ liệu yêu cầu chuyển kho");
    } finally {
      setIsLoading(false);
    }
  };
  // Listen for SignalR notifications
  useEffect(() => {
    const handleNewOrder = () => {
      if (warehouseId) {
        loadTransferData(warehouseId); // Gọi lại để reload dữ liệu
      }
    };

    connection.on("ReceiveNotification", handleNewOrder);
    return () => {
      connection.off("ReceiveNotification", handleNewOrder);
    };
  }, [warehouseId]);
  const handleTransferApproved = () => {
    if (warehouseId) {
      loadTransferData(warehouseId);
    }
    toast.success("Đã phê duyệt yêu cầu chuyển kho thành công");
  };
  const handleTransferImported = () => {
    if (warehouseId) {
      loadTransferData(warehouseId);
    }
    toast.success("Nhập điều phối thành công");
  };
  return (
    <div className="space-y-6 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý chuyển kho
          </h1>
        </div>
      </div>

      <Card>
        <CardContent>
          <Tabs
            defaultValue="outgoing"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="outgoing" className="flex items-center">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Yêu cầu chuyển đến
                {outgoingTransfers.length > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                    {outgoingTransfers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="incoming" className="flex items-center">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Yêu cầu chuyển đi
                {incomingTransfers.length > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                    {incomingTransfers.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="outgoing" className="mt-0">
              <OutgoingTransfers
                transfers={outgoingTransfers}
                isLoading={isLoading}
                onRefresh={handleTransferImported}
              />
            </TabsContent>
            <TabsContent value="incoming" className="mt-0">
              <IncomingTransfers
                transfers={incomingTransfers}
                isLoading={isLoading}
                onApproved={handleTransferApproved}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
