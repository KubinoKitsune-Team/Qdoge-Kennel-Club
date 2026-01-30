import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEpochTransfers, type EpochTransfer } from "@/services/backend.service";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { EXPLORER_URL } from "@/constants";
import { cn } from "@/utils";

const fmt = (n: number) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return abs >= 1e6 ? `${sign}${(abs / 1e6).toFixed(1)}M` : abs >= 1e3 ? `${sign}${(abs / 1e3).toFixed(0)}K` : n.toLocaleString();
};
const short = (s: string) => `${s.slice(0, 5)}...${s.slice(-5)}`;

const tableClass = "table-auto [&_td]:whitespace-nowrap [&_td]:text-center [&_th]:text-center";
const headerClass = "text-xs sticky top-0 z-20 border-b border-border/60 bg-card/90 backdrop-blur-sm [&_th]:sticky [&_th]:top-0 [&_th]:bg-card/90 [&_th]:text-card-foreground [&_th]:shadow-sm";
const bodyClass = "divide-y divide-border/40 text-muted-foreground text-xs";
const cardClass = "flex-1 min-h-0 border border-border/60 bg-card/70 p-2 shadow-inner shadow-black/5 dark:shadow-black/40";

const EpochTransfers: React.FC<{ epoch: number; searchTerm?: string }> = ({ epoch, searchTerm = "" }) => {
  const [transfers, setTransfers] = useState<EpochTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchEpochTransfers(epoch)
      .then(setTransfers)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch"))
      .finally(() => setIsLoading(false));
  }, [epoch]);

  // Filter transfers by search term
  const filteredTransfers = useMemo(() => {
    if (!searchTerm.trim()) return transfers;
    const term = searchTerm.toLowerCase();
    return transfers.filter(t => 
      t.source.toLowerCase().includes(term) || 
      t.destination.toLowerCase().includes(term)
    );
  }, [transfers, searchTerm]);

  const { senders, receivers, totals } = useMemo(() => {
    const senderMap = new Map<string, { amount: number; count: number }>();
    const receiverMap = new Map<string, { amount: number; count: number }>();
    const totalMap = new Map<string, { wallet: string; sent: number; received: number; sentCount: number; receivedCount: number }>();

    filteredTransfers.forEach(({ source, destination, amount }) => {
      const amountNum = Number(amount);

      // Update sender
      const s = senderMap.get(source) || { amount: 0, count: 0 };
      s.amount += amountNum;
      s.count += 1;
      senderMap.set(source, s);

      // Update receiver
      const r = receiverMap.get(destination) || { amount: 0, count: 0 };
      r.amount += amountNum;
      r.count += 1;
      receiverMap.set(destination, r);

      // Update sender total
      const st = totalMap.get(source) || { wallet: source, sent: 0, received: 0, sentCount: 0, receivedCount: 0 };
      st.sent += amountNum;
      st.sentCount += 1;
      totalMap.set(source, st);

      // Update receiver total
      const rt = totalMap.get(destination) || { wallet: destination, sent: 0, received: 0, sentCount: 0, receivedCount: 0 };
      rt.received += amountNum;
      rt.receivedCount += 1;
      totalMap.set(destination, rt);
    });

    const toArr = (m: Map<string, { amount: number; count: number }>) => 
      [...m].map(([wallet, { amount, count }]) => ({ wallet, amount, count })).sort((a, b) => b.amount - a.amount);
    
    return { 
      senders: toArr(senderMap), 
      receivers: toArr(receiverMap), 
      totals: [...totalMap.values()].map(t => ({ ...t, net: t.received - t.sent, totalCount: t.sentCount + t.receivedCount })).sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    };
  }, [filteredTransfers]);

  if (isLoading || error || !transfers.length) {
    return (
      <div className={`${cardClass} flex items-center justify-center min-h-[200px]`}>
        <p className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")}>{isLoading ? "Loading..." : error || "No transfers"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm md:text-base font-semibold">Epoch {epoch} Transfers</span>
        <span className="text-xs text-muted-foreground">
          {searchTerm ? `${filteredTransfers.length} / ${transfers.length}` : `${transfers.length}`} transfers
        </span>
      </div>

      <div className="grid w-full gap-3 grid-cols-1 md:grid-cols-2">
        {/* Transfers Table */}
        <section className="flex flex-col h-[240px] md:h-[220px] md:col-span-2">
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={`${tableClass} min-w-[600px] md:min-w-[800px]`}>
                  <TableHeader className={headerClass}>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tick</TableHead>
                      <TableHead className="hidden md:table-cell">TxID</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Date&Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className={bodyClass}>
                    {filteredTransfers.map((t) => (
                      <TableRow key={t.transfer_id}>
                        <TableCell>{t.asset_name}</TableCell>
                        <TableCell className="!text-right text-blue-500">{Number(t.amount).toLocaleString()}</TableCell>
                        <TableCell className="!text-right">{t.tick.toLocaleString()}</TableCell>
                        <TableCell className="hidden md:table-cell truncate">
                          <Link to={`${EXPLORER_URL}/network/tx/${t.tx_hash}`} target="_blank" className="text-primary hover:text-primary/70">{short(t.tx_hash)}</Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/entity/${t.source}`} className="text-primary hover:text-primary/70">{short(t.source)}</Link>
                        </TableCell>
                        <TableCell>
                          <Link to={`/entity/${t.destination}`} className="text-primary hover:text-primary/70">{short(t.destination)}</Link>
                        </TableCell>
                        <TableCell>{new Date(t.tickdate).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </section>

        {/* Senders */}
        <section className="flex flex-col h-[220px] md:h-[220px]">
          <div className="rounded-md border border-orange-500/50 bg-orange-500/10 px-2 py-1 mb-1.5">
            <p className="text-[10px] font-medium text-orange-500">Senders: {senders.length}</p>
          </div>
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={tableClass}>
                  <TableHeader className={headerClass}>
                    <TableRow>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className={bodyClass}>
                    {senders.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Link to={`/entity/${s.wallet}`} className="text-primary hover:text-primary/70">{short(s.wallet)}</Link>
                        </TableCell>
                        <TableCell className="!text-right">{s.count}</TableCell>
                        <TableCell className="!text-right text-orange-500">{fmt(s.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </section>

        {/* Receivers */}
        <section className="flex flex-col h-[220px] md:h-[220px]">
          <div className="rounded-md border border-blue-500/50 bg-blue-500/10 px-2 py-1 mb-1.5">
            <p className="text-[10px] font-medium text-blue-500">Receivers: {receivers.length}</p>
          </div>
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={tableClass}>
                  <TableHeader className={headerClass}>
                    <TableRow>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className={bodyClass}>
                    {receivers.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Link to={`/entity/${r.wallet}`} className="text-primary hover:text-primary/70">{short(r.wallet)}</Link>
                        </TableCell>
                        <TableCell className="!text-right">{r.count}</TableCell>
                        <TableCell className="!text-right text-blue-500">{fmt(r.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </section>

        {/* Totals */}
        <section className="flex flex-col h-[220px] md:h-[220px] md:col-span-2">
          <div className="rounded-md border border-primary/50 bg-primary/10 px-2 py-1 mb-1.5">
            <p className="text-[10px] font-medium text-primary">All Wallets: {totals.length}</p>
          </div>
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={`${tableClass} min-w-[600px]`}>
                  <TableHeader className={headerClass}>
                    <TableRow>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Sent_Count</TableHead>
                      <TableHead>Sent_Amt</TableHead>
                      <TableHead>Recv_Count</TableHead>
                      <TableHead>Recv_Amt</TableHead>
                      <TableHead>Total_Count</TableHead>
                      <TableHead>Net_Amt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className={bodyClass}>
                    {totals.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Link to={`/entity/${t.wallet}`} className="text-primary hover:text-primary/70">{short(t.wallet)}</Link>
                        </TableCell>
                        <TableCell className="!text-right">{t.sentCount}</TableCell>
                        <TableCell className="!text-right text-orange-500">{fmt(t.sent)}</TableCell>
                        <TableCell className="!text-right">{t.receivedCount}</TableCell>
                        <TableCell className="!text-right text-blue-500">{fmt(t.received)}</TableCell>
                        <TableCell className="!text-right">{t.totalCount}</TableCell>
                        <TableCell className={cn("!text-right font-medium", t.net > 0 ? "text-blue-500" : t.net < 0 ? "text-orange-500" : "text-muted-foreground")}>
                          {fmt(t.net)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EpochTransfers;
