import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchTransfers } from "@/services/api.service";
import { useState, useEffect } from "react";
import { Transfer } from "@/types/qx.types";
import { Link } from "react-router-dom";
import { EXPLORER_URL } from "@/constants";

const AssetTransfer: React.FC = () => {

    const [assetTransfers, setAssetTransfers] = useState<Transfer[]>([]);

    useEffect(() => {
        const getAssetTransfersHistory = async () => {
            const res: Transfer[] = await fetchTransfers();
            setAssetTransfers(res);
        };
        getAssetTransfersHistory();
    }, []);

    return (
        <div className="flex h-full min-h-0 w-full flex-col gap-4">
            <div className="flex items-center justify-center">
                <p className="text-xl font-bold">Latest Assets Transfer</p>
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
                                {assetTransfers.map((assetTransfer, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Link to={`/qx-assets/${assetTransfer.extraData.issuer}/${assetTransfer.extraData.name}`} className="text-primary hover:text-primary/70">
                                                {assetTransfer.extraData.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="!text-right">{assetTransfer.extraData.numberOfShares.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Link to={`${EXPLORER_URL}/network/tick/${assetTransfer.tick}`} target="_blank" className="text-primary hover:text-primary/70">
                                                {assetTransfer.tick}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate">
                                            <Link to={`${EXPLORER_URL}/network/tx/${assetTransfer.hash}`} target="_blank" className="text-primary hover:text-primary/70">
                                                {assetTransfer.hash.slice(0, 5)}...{assetTransfer.hash.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/entity/${assetTransfer.source}`} className="text-primary hover:text-primary/70">
                                                {assetTransfer.source.slice(0,5)}...{assetTransfer.source.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/entity/${assetTransfer.extraData.newOwner}`} className="text-primary hover:text-primary/70">
                                                {assetTransfer.extraData.newOwner.slice(0,5)}...{assetTransfer.extraData.newOwner.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{new Date(assetTransfer.tickTime).toLocaleString()}</TableCell>
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

export default AssetTransfer;