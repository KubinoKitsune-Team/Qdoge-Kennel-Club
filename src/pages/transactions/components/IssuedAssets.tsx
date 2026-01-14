import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchTransfers } from "@/services/api.service";
import { useState, useEffect } from "react";
import { Transfer } from "@/types/qx.types";
import { Link } from "react-router-dom";
import { EXPLORER_URL } from "@/constants";

const IssuedAssets: React.FC = () => {

    const [issuedAssets, setIssuedAssets] = useState<Transfer[]>([]);

    useEffect(() => {
        const getIssuedAssetsHistory = async () => {
            const res: Transfer[] = await fetchTransfers();
            setIssuedAssets(res);
        };
        getIssuedAssetsHistory();
    }, []);

    return (
        <div className="flex h-full min-h-0 w-full flex-col gap-4">
            <div className="flex items-center justify-center">
                <p className="text-xl font-bold">Assets Transfer</p>
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
                                {issuedAssets.map((issuedAsset, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{issuedAsset.extraData.name}</TableCell>
                                        <TableCell className="!text-right">{issuedAsset.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Link to={`${EXPLORER_URL}/network/tick/${issuedAsset.tick}`} target="_blank" className="text-primary hover:text-primary/70">
                                                {issuedAsset.tick}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate">
                                            <Link to={`${EXPLORER_URL}/network/tx/${issuedAsset.hash}`} target="_blank" className="text-primary hover:text-primary/70">
                                                {issuedAsset.hash.slice(0, 5)}...{issuedAsset.hash.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/entity/${issuedAsset.source}`} className="text-primary hover:text-primary/70">
                                                {issuedAsset.source.slice(0,5)}...{issuedAsset.source.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/entity/${issuedAsset.extraData.newOwner}`} className="text-primary hover:text-primary/70">
                                                {issuedAsset.extraData.newOwner.slice(0,5)}...{issuedAsset.extraData.newOwner.slice(-5)}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{new Date(issuedAsset.tickTime).toLocaleString()}</TableCell>
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

export default IssuedAssets;