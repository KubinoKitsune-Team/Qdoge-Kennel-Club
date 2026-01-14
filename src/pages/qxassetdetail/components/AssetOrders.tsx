import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchAssetAskOrders, fetchAssetBidOrders } from "@/services/api.service";
import { useState, useEffect } from "react";
import { AssetOrder } from "@/types/qx.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const AssetOrders: React.FC<{ issuer: string, asset: string, type: string }> = ({ issuer, asset, type }) => {

    const [assetOrders, setAssetOrders] = useState<AssetOrder[]>([]);

    useEffect(() => {
        const getEntityOrders = async () => {
            let res: AssetOrder[] = [];
            if(type==="asks") res = await fetchAssetAskOrders(issuer, asset);
            if(type==="bids") res = await fetchAssetBidOrders(issuer, asset);
            setAssetOrders(res);
        };
        getEntityOrders();
    }, [issuer, asset, type]);

    return (
        <div className="flex h-full min-h-0 w-full flex-col gap-4">
            <div className="flex items-center justify-center">
                <p className="text-xl font-bold">Open {type === "asks" ? "Sell" : "Buy"} Orders</p>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden border border-border/60 bg-card/70 p-2 shadow-inner shadow-black/5 dark:shadow-black/40">
                <ScrollArea
                    type="hover"
                    scrollHideDelay={200}
                    className="h-full max-h-full"
                >
                    <div className="pr-1">
                        <Table
                            wrapperClassName="h-full min-h-0 !overflow-visible"
                            className="table-auto [&_td]:whitespace-nowrap [&_td]:text-center [&_th]:text-center"
                        >
                            <TableHeader className="text-xs sticky top-0 z-20 border-b border-border/60 bg-card/90 backdrop-blur-sm [&_th]:sticky [&_th]:top-0 [&_th]:bg-card/90 [&_th]:text-card-foreground [&_th]:shadow-sm">
                                <TableRow>
                                    <TableHead>Price(Qu)</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total(Qu)</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>  
                            <TableBody className="divide-y divide-border/40 text-muted-foreground text-xs">
                                {assetOrders.map((assetOrder, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{assetOrder.price.toLocaleString()}</TableCell>
                                        <TableCell className="!text-right">{assetOrder.numberOfShares.toLocaleString()}</TableCell>
                                        <TableCell className="!text-right">{(assetOrder.price * assetOrder.numberOfShares).toLocaleString()}</TableCell>
                                        <TableCell className="!text-right">
                                            <Button variant="outline" size="sm" className={cn(type === "asks" ? "bg-green-500 text-white hover:bg-green-900" : "bg-red-500 text-white hover:bg-red-900")}>
                                                {type === "asks" ? "Sell" : "Buy"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

export default AssetOrders;