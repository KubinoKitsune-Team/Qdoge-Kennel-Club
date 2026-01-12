import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEntityTrades } from "@/services/api.service";
import { useState, useEffect } from "react";
import { Trade } from "@/types/qx.types";
import { Link } from "react-router-dom";
import { EXPLORER_URL } from "@/constants";

const TradeHistory: React.FC<{ entity: string }> = ({ entity }) => {

    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const res = await fetchEntityTrades(entity);
            setTrades(res);
        };
        fetchOrders();
    }, [entity]);

    return (
        <div className="flex h-full min-h-0 w-full flex-col gap-4">
            <div className="flex items-center justify-center">
                <p className="text-xl font-bold">Trade History</p>
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
                                {trades.map((trade, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{trade.assetName}</TableCell>
                                        <TableCell>{trade.bid ? "Buy" : "Sell"}</TableCell>
                                        <TableCell className="text-right">{trade.price.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{trade.numberOfShares.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{(trade.price * trade.numberOfShares).toLocaleString()}</TableCell>
                                        <TableCell className="truncate">
                                            <Link to={`${EXPLORER_URL}/network/tx/${trade.transactionHash}`} target="_blank" className="text-blue-500 hover:underline">
                                                {trade.transactionHash.slice(0, 5)}...{trade.transactionHash.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{trade.taker.slice(0, 5)}...{trade.taker.slice(-5)}</TableCell>
                                        <TableCell>{trade.maker.slice(0, 5)}...{trade.maker.slice(-5)}</TableCell>
                                        <TableCell>{new Date(trade.tickTime).toLocaleString()}</TableCell>
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

export default TradeHistory;