import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchEpochRangeTrades, type EpochTrade } from "@/services/backend.service";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { EXPLORER_URL } from "@/constants";
import { cn } from "@/utils";

const fmt = (n: number) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  return abs >= 1e6 ? `${sign}${(abs / 1e6).toFixed(1)}M` : abs >= 1e3 ? `${sign}${(abs / 1e3).toFixed(0)}K` : n.toLocaleString();
};
const short = (s: string) => `${s.slice(0, 5)}...${s.slice(-5)}`;

const WalletDisplay = ({ wallet, isZealyRegistered, connectedWallet }: { wallet: string; isZealyRegistered: boolean; connectedWallet: string | null }) => {
  const isYou = connectedWallet && wallet === connectedWallet;
  return (
    <div className="flex items-center gap-1">
      {isYou ? (
        <span className="text-yellow-500 font-semibold">YOU</span>
      ) : (
        <Link to={`/entity/${wallet}`} className="text-primary hover:text-primary/70">{short(wallet)}</Link>
      )}
      {isZealyRegistered && <span className="text-green-500 text-xs">✅</span>}
    </div>
  );
};

const tableClass = "table-auto [&_td]:whitespace-nowrap [&_td]:text-center [&_th]:text-center";
const headerClass = "text-xs sticky top-0 z-20 border-b border-border/60 bg-card/90 backdrop-blur-sm [&_th]:sticky [&_th]:top-0 [&_th]:bg-card/90 [&_th]:text-card-foreground [&_th]:shadow-sm";
const bodyClass = "divide-y divide-border/40 text-muted-foreground text-xs";
const cardClass = "flex-1 min-h-0 border border-border/60 bg-card/70 p-2 shadow-inner shadow-black/5 dark:shadow-black/40";

const EpochRangeTrades: React.FC<{ startEpoch: number; endEpoch: number; searchTerm?: string; connectedWallet?: string | null }> = ({
  startEpoch,
  endEpoch,
  searchTerm = "",
  connectedWallet = null,
}) => {
  const [trades, setTrades] = useState<EpochTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchEpochRangeTrades(startEpoch, endEpoch)
      .then(setTrades)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch"))
      .finally(() => setIsLoading(false));
  }, [startEpoch, endEpoch]);

  const filteredTrades = useMemo(() => {
    if (!searchTerm.trim()) return trades;
    const term = searchTerm.toLowerCase();
    return trades.filter(
      (t) => t.taker_wallet.toLowerCase().includes(term) || t.maker_wallet.toLowerCase().includes(term)
    );
  }, [trades, searchTerm]);

  const { buyers, sellers, totals } = useMemo(() => {
    const bMap = new Map<string, { amount: number; tokens: number; zealy: boolean }>();
    const sMap = new Map<string, { amount: number; tokens: number; zealy: boolean }>();
    const tMap = new Map<string, { wallet: string; buy: number; sell: number; buyTokens: number; sellTokens: number; zealy: boolean }>();

    filteredTrades.forEach(({ type, price, quantity, taker_wallet, maker_wallet, taker_is_zealy_registered, maker_is_zealy_registered }) => {
      const tradeAmount = Number(price) * Number(quantity);
      const quantityNum = Number(quantity);

      if (type === "buy") {
        const buyer = taker_wallet, seller = maker_wallet;
        const b = bMap.get(buyer) || { amount: 0, tokens: 0, zealy: taker_is_zealy_registered };
        b.amount += tradeAmount;
        b.tokens += quantityNum;
        bMap.set(buyer, b);

        const s = sMap.get(seller) || { amount: 0, tokens: 0, zealy: maker_is_zealy_registered };
        s.amount += tradeAmount;
        s.tokens += quantityNum;
        sMap.set(seller, s);

        const bt = tMap.get(buyer) || { wallet: buyer, buy: 0, sell: 0, buyTokens: 0, sellTokens: 0, zealy: taker_is_zealy_registered };
        bt.buy += tradeAmount;
        bt.buyTokens += quantityNum;
        tMap.set(buyer, bt);

        const st = tMap.get(seller) || { wallet: seller, buy: 0, sell: 0, buyTokens: 0, sellTokens: 0, zealy: maker_is_zealy_registered };
        st.sell += tradeAmount;
        st.sellTokens += quantityNum;
        tMap.set(seller, st);
      } else {
        const seller = taker_wallet, buyer = maker_wallet;
        const s = sMap.get(seller) || { amount: 0, tokens: 0, zealy: taker_is_zealy_registered };
        s.amount += tradeAmount;
        s.tokens += quantityNum;
        sMap.set(seller, s);

        const b = bMap.get(buyer) || { amount: 0, tokens: 0, zealy: maker_is_zealy_registered };
        b.amount += tradeAmount;
        b.tokens += quantityNum;
        bMap.set(buyer, b);

        const st = tMap.get(seller) || { wallet: seller, buy: 0, sell: 0, buyTokens: 0, sellTokens: 0, zealy: taker_is_zealy_registered };
        st.sell += tradeAmount;
        st.sellTokens += quantityNum;
        tMap.set(seller, st);

        const bt = tMap.get(buyer) || { wallet: buyer, buy: 0, sell: 0, buyTokens: 0, sellTokens: 0, zealy: maker_is_zealy_registered };
        bt.buy += tradeAmount;
        bt.buyTokens += quantityNum;
        tMap.set(buyer, bt);
      }
    });

    const toArr = (m: Map<string, { amount: number; tokens: number; zealy: boolean }>) =>
      [...m].map(([wallet, { amount, tokens, zealy }]) => ({ wallet, amount, tokens, isZealyRegistered: zealy })).sort((a, b) => b.amount - a.amount);

    return {
      buyers: toArr(bMap),
      sellers: toArr(sMap),
      totals: [...tMap.values()]
        .map((t) => ({ ...t, isZealyRegistered: t.zealy, total: t.buy - t.sell, totalTokens: t.buyTokens - t.sellTokens }))
        .sort((a, b) => Math.abs(b.total) - Math.abs(a.total)),
    };
  }, [filteredTrades]);

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
        <span className="text-sm md:text-base font-semibold">Monthly Trades ({startEpoch}~{endEpoch})</span>
        <span className="text-xs text-muted-foreground">
          {searchTerm ? `${filteredTrades.length} / ${trades.length}` : `${trades.length}`} trades
        </span>
      </div>

      <div className="grid w-full gap-3 grid-cols-1 md:grid-cols-2">
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
                    {filteredTrades.map((t) => (
                      <TableRow key={t.trade_id}>
                        <TableCell className={cn(t.type === "buy" ? "text-green-500" : "text-red-500")}>{t.type === "buy" ? "Buy" : "Sell"}</TableCell>
                        <TableCell className="!text-right">{Number(t.price).toLocaleString()}</TableCell>
                        <TableCell className="!text-right">{Number(t.quantity).toLocaleString()}</TableCell>
                        <TableCell className="!text-right">{Number(t.total).toLocaleString()}</TableCell>
                        <TableCell className="hidden md:table-cell truncate">
                          <Link to={`${EXPLORER_URL}/network/tx/${t.tx_hash}`} target="_blank" className="text-primary hover:text-primary/70">{short(t.tx_hash)}</Link>
                        </TableCell>
                        <TableCell><WalletDisplay wallet={t.taker_wallet} isZealyRegistered={t.taker_is_zealy_registered} connectedWallet={connectedWallet} /></TableCell>
                        <TableCell className="hidden md:table-cell"><WalletDisplay wallet={t.maker_wallet} isZealyRegistered={t.maker_is_zealy_registered} connectedWallet={connectedWallet} /></TableCell>
                        <TableCell>{new Date(t.tickdate).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </section>

        <section className="flex flex-col h-[220px] md:h-[220px]">
          <div className="rounded-md border border-green-500/50 bg-green-500/10 px-2 py-1 mb-1.5">
            <p className="text-[10px] font-medium text-green-500">Buyers: {buyers.length}</p>
          </div>
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={tableClass}>
                  <TableHeader className={headerClass}><TableRow><TableHead>Wallet</TableHead><TableHead>Token</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
                  <TableBody className={bodyClass}>
                    {buyers.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell><WalletDisplay wallet={b.wallet} isZealyRegistered={b.isZealyRegistered} connectedWallet={connectedWallet} /></TableCell>
                        <TableCell className="!text-right">{fmt(b.tokens)}</TableCell>
                        <TableCell className="!text-right text-green-500">{fmt(b.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </section>

        <section className="flex flex-col h-[220px] md:h-[220px]">
          <div className="rounded-md border border-red-500/50 bg-red-500/10 px-2 py-1 mb-1.5">
            <p className="text-[10px] font-medium text-red-500">Sellers: {sellers.length}</p>
          </div>
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={tableClass}>
                  <TableHeader className={headerClass}><TableRow><TableHead>Wallet</TableHead><TableHead>Token</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
                  <TableBody className={bodyClass}>
                    {sellers.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell><WalletDisplay wallet={s.wallet} isZealyRegistered={s.isZealyRegistered} connectedWallet={connectedWallet} /></TableCell>
                        <TableCell className="!text-right">{fmt(s.tokens)}</TableCell>
                        <TableCell className="!text-right text-red-500">{fmt(s.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </div>
        </section>

        <section className="flex flex-col h-[220px] md:h-[220px] md:col-span-2">
          <div className="rounded-md border border-primary/50 bg-primary/10 px-2 py-1 mb-1.5">
            <p className="text-[10px] font-medium text-primary">All Traders: {totals.length}</p>
          </div>
          <div className={cardClass}>
            <ScrollArea type="hover" scrollHideDelay={200} className="h-full">
              <div className="pr-1">
                <Table wrapperClassName="h-full min-h-0 !overflow-visible" className={`${tableClass} min-w-[600px]`}>
                  <TableHeader className={headerClass}>
                    <TableRow>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Buy_Token</TableHead>
                      <TableHead>Buy_Amt</TableHead>
                      <TableHead>Sell_Token</TableHead>
                      <TableHead>Sell_Amt</TableHead>
                      <TableHead>Total_Token</TableHead>
                      <TableHead>Total_Amt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className={bodyClass}>
                    {totals.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <WalletDisplay wallet={t.wallet} isZealyRegistered={t.isZealyRegistered} connectedWallet={connectedWallet} />
                        </TableCell>
                        <TableCell className="!text-right">{fmt(t.buyTokens)}</TableCell>
                        <TableCell className="!text-right text-green-500">{fmt(t.buy)}</TableCell>
                        <TableCell className="!text-right">{fmt(t.sellTokens)}</TableCell>
                        <TableCell className="!text-right text-red-500">{fmt(t.sell)}</TableCell>
                        <TableCell className="!text-right text-primary">{fmt(t.totalTokens)}</TableCell>
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

export default EpochRangeTrades;

