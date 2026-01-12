import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LookUp: React.FC<{ entity: string, setEntity: (entity: string) => void, handleLookup: (entity: string) => void }> = ({ entity, setEntity, handleLookup }) => {
    
    return (
        <Card className="w-full rounded-xl border border-border/60 bg-card/90 px-2 py-8 text-foreground shadow-md backdrop-blur-2xl sm:px-10">
            <div className="space-y-2 text-center text-foreground">
              <p className="text-2xl font-semibold">Entity Search</p>
              <p className="text-sm text-muted-foreground">Show trades and open orders of an entity.</p>
            </div>
            <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-4 md:flex-row">
              <Input
                value={entity}
                onChange={(event) => setEntity(event.target.value)}
                placeholder="Enter public ID"
                className="flex-1 rounded-xl border border-border/40 bg-muted/20 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
              />
              <Button
                type="button"
                onClick={() => handleLookup(entity)}
                className="rounded-xl bg-primary px-4 font-semibold text-primary-foreground shadow-xl transition hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/40"
              >
                Lookup Trader
              </Button>
            </div>
        </Card>
    );
}

export default LookUp;