import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Package } from "lucide-react";
import warehouseExportService from "@/services/warehouse-export-service";
import { toast } from "sonner";

interface TopExportedProduct {
    productId: number;
    productCode: string;
    productName: string;
    totalExportedQuantity: number;
}
interface TopExportProps {
    topCount: string
}
export function TopExportedProducts({ topCount }: TopExportProps) {
    const [products, setProducts] = useState<TopExportedProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTopExportedProducts = async () => {
            try {
                setIsLoading(true);
                const data = await warehouseExportService.getTopExportedProducts(parseInt(topCount));
                setProducts(data);
            } catch (error) {
                console.error("Error fetching top exported products:", error);
                toast.error("Không thể tải dữ liệu sản phẩm xuất nhiều nhất");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopExportedProducts();
    }, [topCount]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sản phẩm xuất nhiều nhất</CardTitle>
                    <CardDescription>Đang tải dữ liệu...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>

            <CardContent>
                <div className="space-y-4">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div
                                key={product.productId}
                                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                            >
                                <div className="flex items-center space-x-4">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{product.productName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {product.productCode}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {product.totalExportedQuantity.toLocaleString("vi-VN")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Số lượng xuất</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-4">
                            Không có dữ liệu sản phẩm xuất kho
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 