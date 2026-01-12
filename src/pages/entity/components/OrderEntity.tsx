import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEntityAskOrders, fetchEntityBidOrders } from "@/services/api.service";
import { useState, useEffect } from "react";
import { EntityOrder } from "@/types/qx.types";

const SellOrderEntity: React.FC<{ entity: string, type: string }> = ({ entity, type }) => {

    const [orders, setOrders] = useState<EntityOrder[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (type === "asks") {
                const res = await fetchEntityAskOrders(entity);
                setOrders(res);
            }
            if (type === "bids") {
                const res = await fetchEntityBidOrders(entity);
                setOrders(res);
            }
        };
        fetchOrders();
    }, [entity, type]);

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
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Issuer</TableHead>
                                    <TableHead>Price(Qu)</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total(Qu)</TableHead>
                                </TableRow>
                            </TableHeader>  
                            <TableBody className="divide-y divide-border/40 text-muted-foreground text-xs">
                                {orders.map((order, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{order.assetName}</TableCell>
                                        <TableCell>{order.issuerId.slice(0, 5)}...{order.issuerId.slice(-5)}</TableCell>
                                        <TableCell className="text-right">{order.price.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{order.numberOfShares.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{(order.price * order.numberOfShares).toLocaleString()}</TableCell>
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

export default SellOrderEntity;