import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEpochTrades, type EpochTrade } from "@/services/backend.service";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { EXPLORER_URL } from "@/constants";
import { cn } from "@/utils";

const fmt = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n.toLocaleString();
const short = (s: string) => `${s.slice(0, 5)}...${s.slice(-5)}`;
const WalletLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link to={`/entity/${to}`} className="text-primary hover:text-primary/70">{children}</Link>
);

const tableClass = "table-auto [&_td]:whitespace-nowrap [&_td]:text-center [&_th]:text-center";
const headerClass = "text-xs sticky top-0 z-20 border-b border-border/60 bg-card/90 backdrop-blur-sm [&_th]:sticky [&_th]:top-0 [&_th]:bg-card/90 [&_th]:text-card-foreground [&_th]:shadow-sm";
const bodyClass = "divide-y divide-border/40 text-muted-foreground text-xs";
const cardClass = "flex-1 min-h-0 border border-border/60 bg-card/70 p-2 shadow-inner shadow-black/5 dark:shadow-black/40";

const EpochTrades: React.FC<{ epoch: number }> = ({ epoch }) => {
  const [trades, setTrades] = useState<EpochTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchEpochTrades(epoch)
      .then(setTrades)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch"))
      .finally(() => setIsLoading(false));
  }, [epoch]);

  const { buyers, sellers, totals } = useMemo(() => {
    const bMap = new Map<string, number>(), sMap = new Map<string, number>();
    const tMap = new Map<string, { wallet: string; buy: number; sell: number; total: number }>();
    trades.forEach(({ type, total, taker_wallet: w }) => {
      const amt = Number(total), isBuy = type === "buy";
      (isBuy ? bMap : sMap).set(w, ((isBuy ? bMap : sMap).get(w) || 0) + amt);
      const t = tMap.get(w) || { wallet: w, buy: 0, sell: 0, total: 0 };
      isBuy ? (t.buy += amt) : (t.sell += amt);
      t.total += amt;
      tMap.set(w, t);
    });
    const toArr = (m: Map<string, number>) => [...m].map(([wallet, amount]) => ({ wallet, amount })).sort((a, b) => b.amount - a.amount);
    return { buyers: toArr(bMap), sellers: toArr(sMap), totals: [...tMap.values()].sort((a, b) => b.total - a.total) };
  }, [trades]);

  if (isLoading || error || !trades.length) {
    return (
      <div className={`${cardClass} flex items-center justify-center min-h-[200px]`}>
        <p className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")}>{isLoading ? "Loading..." : error || "No trades"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm md:text-base font-semibold">Epoch {epoch} Trades</span>
        <span className="text-xs text-muted-foreground">{trades.length} trades</span>
      </div>

      <div className="grid w-full gap-3 grid-cols-1 md:grid-cols-2">
        {/* Trades Table */}
        <section className="flex flex-col h-[240px] md:h-[220px] md:col-span-2">
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={`${tableClass} min-w-[500px] md:min-w-[700px]`}>
                  <TableHeader className={headerClass}>
                    <TableRow>
                      <TableHead>Side</TableHead><TableHead>Price</TableHead><TableHead>Qty</TableHead><TableHead>Total</TableHead>
                      <TableHead className="hidden md:table-cell">TxID</TableHead><TableHead>Taker</TableHead>
                      <TableHead className="hidden md:table-cell">Maker</TableHead><TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className={bodyClass}>
                    {trades.map((t) => (
                      <TableRow key={t.trade_id}>
                        <TableCell className={cn(t.type === "buy" ? "text-green-500" : "text-red-500")}>{t.type === "buy" ? "Buy" : "Sell"}</TableCell>
                        <TableCell className="!text-right">{Number(t.price).toLocaleString()}</TableCell>
                        <TableCell className="!text-right">{Number(t.quantity).toLocaleString()}</TableCell>
                        <TableCell className="!text-right">{Number(t.total).toLocaleString()}</TableCell>
                        <TableCell className="hidden md:table-cell truncate">
                          <Link to={`${EXPLORER_URL}/network/tx/${t.tx_hash}`} target="_blank" className="text-primary hover:text-primary/70">{short(t.tx_hash)}</Link>
                        </TableCell>
                        <TableCell><WalletLink to={t.taker_wallet}>{short(t.taker_wallet)}</WalletLink></TableCell>
                        <TableCell className="hidden md:table-cell"><WalletLink to={t.maker_wallet}>{short(t.maker_wallet)}</WalletLink></TableCell>
                        <TableCell>{new Date(t.tickdate).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </section>

        {/* Buyers */}
        <section className="flex flex-col h-[220px] md:h-[220px]">
          <div className="rounded-md border border-green-500/50 bg-green-500/10 px-2 py-1 mb-1.5">
            <p className="text-[10px] font-medium text-green-500">Buyers: {buyers.length}</p>
          </div>
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={tableClass}>
                  <TableHeader className={headerClass}><TableRow><TableHead>Wallet</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
                  <TableBody className={bodyClass}>
                    {buyers.map((b, i) => (
                      <TableRow key={i}><TableCell><WalletLink to={b.wallet}>{short(b.wallet)}</WalletLink></TableCell><TableCell className="!text-right text-green-500">{fmt(b.amount)}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </section>

        {/* Sellers */}
        <section className="flex flex-col h-[220px] md:h-[220px]">
          <div className="rounded-md border border-red-500/50 bg-red-500/10 px-2 py-1 mb-1.5">
            <p className="text-[10px] font-medium text-red-500">Sellers: {sellers.length}</p>
          </div>
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={tableClass}>
                  <TableHeader className={headerClass}><TableRow><TableHead>Wallet</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
                  <TableBody className={bodyClass}>
                    {sellers.map((s, i) => (
                      <TableRow key={i}><TableCell><WalletLink to={s.wallet}>{short(s.wallet)}</WalletLink></TableCell><TableCell className="!text-right text-red-500">{fmt(s.amount)}</TableCell></TableRow>
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
            <p className="text-[10px] font-medium text-primary">All Traders: {totals.length}</p>
          </div>
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={`${tableClass} min-w-[300px]`}>
                  <TableHeader className={headerClass}><TableRow><TableHead>Wallet</TableHead><TableHead>Buy</TableHead><TableHead>Sell</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                  <TableBody className={bodyClass}>
                    {totals.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell><WalletLink to={t.wallet}>{short(t.wallet)}</WalletLink></TableCell>
                        <TableCell className="!text-right text-green-500">{fmt(t.buy)}</TableCell>
                        <TableCell className="!text-right text-red-500">{fmt(t.sell)}</TableCell>
                        <TableCell className="!text-right text-primary font-medium">{fmt(t.total)}</TableCell>
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

export default EpochTrades;
