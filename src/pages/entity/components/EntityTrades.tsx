import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEntityTrades } from "@/services/api.service";
import { useState, useEffect } from "react";
import { Trade } from "@/types/qx.types";
import { Link } from "react-router-dom";
import { EXPLORER_URL } from "@/constants";
import { cn } from "@/utils";

const EntityTrades: React.FC<{ entity: string }> = ({ entity }) => {

    const [entityTrades, setEntityTrades] = useState<Trade[]>([]);

    useEffect(() => {
        const getEntityTradesHistory = async () => {
            const res: Trade[] = await fetchEntityTrades(entity);
            setEntityTrades(res);
        };
        getEntityTradesHistory();
    }, [entity]);

    return (
        <div className="flex h-full min-h-0 w-full flex-col gap-4">
            <div className="flex items-center justify-center">
                <p className="text-xl font-bold">Trades</p>
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
                                <TableRow >
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Side</TableHead>
                                    <TableHead>Price(Qu)</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Total(Qu)</TableHead>
                                    <TableHead>TxID</TableHead>
                                    <TableHead>Taker</TableHead>
                                    <TableHead>Maker</TableHead>
                                    <TableHead>Date&Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-border/40 text-muted-foreground text-xs">
                                {entityTrades.map((entityTrade, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{entityTrade.assetName}</TableCell>
                                        <TableCell className={cn(entityTrade.bid ? "text-green-500" : "text-red-500")}>{entityTrade.bid ? "Buy" : "Sell"}</TableCell>
                                        <TableCell className="!text-right">{entityTrade.price.toLocaleString()}</TableCell>
                                        <TableCell className="!text-right">{entityTrade.numberOfShares.toLocaleString()}</TableCell>
                                        <TableCell className="!text-right">{(entityTrade.price * entityTrade.numberOfShares).toLocaleString()}</TableCell>
                                        <TableCell className="truncate">
                                            <Link to={`${EXPLORER_URL}/network/tx/${entityTrade.transactionHash}`} target="_blank" className="text-primary hover:text-primary/70">
                                                {entityTrade.transactionHash.slice(0, 5)}...{entityTrade.transactionHash.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/entity/${entityTrade.taker}`} className="text-primary hover:text-primary/70">
                                                {entityTrade.taker.slice(0, 5)}...{entityTrade.taker.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/entity/${entityTrade.maker}`} className="text-primary hover:text-primary/70">
                                                {entityTrade.maker.slice(0, 5)}...{entityTrade.maker.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{new Date(entityTrade.tickTime).toLocaleString()}</TableCell>
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

export default EntityTrades;