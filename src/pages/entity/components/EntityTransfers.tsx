import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEntityTransfers } from "@/services/api.service";
import { useState, useEffect } from "react";
import { Transfer } from "@/types/qx.types";
import { Link } from "react-router-dom";
import { EXPLORER_URL } from "@/constants";

const EntityTransfers: React.FC<{ entity: string }> = ({ entity }) => {

    const [entityAssetTransfers, setEntityAssetTransfers] = useState<Transfer[]>([]);

    useEffect(() => {
        const getEntityAssetTransfersHistory = async () => {
            const res: Transfer[] = await fetchEntityTransfers(entity);
            setEntityAssetTransfers(res);
        };
        getEntityAssetTransfersHistory();
    }, [entity]);

    return (
        <div className="flex h-full min-h-0 w-full flex-col gap-4">
            <div className="flex items-center justify-center">
                <p className="text-xl font-bold">Asset Transfers</p>
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
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Tick</TableHead>
                                    <TableHead>TxID</TableHead>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Date&Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-border/40 text-muted-foreground text-xs">
                                {entityAssetTransfers.map((entityAssetTransfer, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{entityAssetTransfer.extraData.name}</TableCell>
                                        <TableCell className="!text-right">{entityAssetTransfer.extraData.numberOfShares.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Link to={`${EXPLORER_URL}/network/tick/${entityAssetTransfer.tick}`} target="_blank" className="text-primary hover:text-primary/70">
                                                {entityAssetTransfer.tick}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate">
                                            <Link to={`${EXPLORER_URL}/network/tx/${entityAssetTransfer.hash}`} target="_blank" className="text-primary hover:text-primary/70">
                                                {entityAssetTransfer.hash.slice(0, 5)}...{entityAssetTransfer.hash.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/entity/${entityAssetTransfer.source}`} className="text-primary hover:text-primary/70">
                                                {entityAssetTransfer.source.slice(0,5)}...{entityAssetTransfer.source.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/entity/${entityAssetTransfer.extraData.newOwner}`} className="text-primary hover:text-primary/70">
                                                {entityAssetTransfer.extraData.newOwner.slice(0,5)}...{entityAssetTransfer.extraData.newOwner.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{new Date(entityAssetTransfer.tickTime).toLocaleString()}</TableCell>
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

export default EntityTransfers;