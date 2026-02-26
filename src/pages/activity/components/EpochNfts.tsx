import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchQubicBayQdogeListings,
  type QubicBayListing,
  type QubicBayMetadata,
} from "@/services/backend.service";
import { cn } from "@/utils";

const short = (value: string) => `${value.slice(0, 7)}...${value.slice(-6)}`;

const formatAmount = (value: string | number) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return amount.toLocaleString();
};

const toHttpImageUrl = (value: string) => {
  if (value.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${value.replace("ipfs://", "")}`;
  }
  return value;
};

const resolveNftType = (collectionId: number) => (collectionId === 15 ? "QDOGE" : "UNKNOWN");

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-start justify-between gap-3 border-b border-border/40 py-2 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium break-all">{value}</span>
  </div>
);

const MetadataItem = ({ item }: { item: QubicBayMetadata }) => (
  <div className="rounded-md border border-border/50 bg-muted/20 px-2 py-1 text-xs">
    <p className="text-muted-foreground">{item.trait_type}</p>
    <p className="font-medium text-foreground break-all">{item.value}</p>
  </div>
);

const EpochNfts: React.FC = () => {
  const [listings, setListings] = useState<QubicBayListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<QubicBayListing | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchQubicBayQdogeListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch NFT listings"))
      .finally(() => setIsLoading(false));
  }, []);

  const sortedListings = useMemo(
    () =>
      [...listings].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [listings],
  );

  if (isLoading || error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-border/60 bg-card/70 p-4">
        <p className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")}>
          {isLoading ? "Loading NFT listings..." : error}
        </p>
      </div>
    );
  }

  if (!sortedListings.length) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-border/60 bg-card/70 p-4">
        <p className="text-sm text-muted-foreground">No NFT listings found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sortedListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden border-border/70 bg-card/95">
            <div className="aspect-square w-full overflow-hidden bg-muted/20">
              <img
                src={toHttpImageUrl(listing.nft.imageUrl)}
                alt={listing.nft.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <CardHeader className="p-3 pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm">{listing.nft.name}</CardTitle>
                <Badge variant="outline">{resolveNftType(listing.nft.collectionId)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 px-3 pb-2 pt-0 text-xs">
              <DetailRow label="Owner" value={short(listing.nft.ownerId)} />
              <DetailRow label="Value" value={`${formatAmount(listing.price)} ${listing.currency}`} />
            </CardContent>
            <CardFooter className="px-3 pb-3 pt-1">
              <Button className="w-full" size="sm" onClick={() => setSelectedListing(listing)}>
                view detail
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(selectedListing)} onOpenChange={(open) => !open && setSelectedListing(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedListing.nft.name}</DialogTitle>
                <DialogDescription>NFT Detail View</DialogDescription>
              </DialogHeader>

              <section className="space-y-1">
                <h3 className="text-sm font-semibold">NFT Details</h3>
                <DetailRow label="ID" value={selectedListing.nftId} />
                <DetailRow label="Creator" value={selectedListing.nft.creatorId} />
                <DetailRow label="Owner" value={selectedListing.nft.ownerId} />
                <DetailRow label="Total trades" value={selectedListing.nft.totalTrades} />
                <DetailRow label="Total Volume" value={selectedListing.nft.totalTradeVolume} />
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Attributes</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedListing.nft.metadata.map((item, index) => (
                    <MetadataItem key={`${item.trait_type}-${item.value}-${index}`} item={item} />
                  ))}
                </div>
              </section>

              <section className="space-y-1">
                <h3 className="text-sm font-semibold">Activity History</h3>
                <DetailRow
                  label="Minted date"
                  value={new Date(selectedListing.nft.createdAt).toLocaleString()}
                />
                <DetailRow label="Minted price" value={selectedListing.nft.lastPrice} />
                <DetailRow label="Mintor" value={selectedListing.seller.id} />
              </section>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EpochNfts;
