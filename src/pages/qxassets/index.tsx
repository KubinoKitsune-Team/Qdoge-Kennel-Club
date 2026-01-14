import { ISSUER } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const QXAssets: React.FC = () => {
    // Smart Contract Shares - assets with the standard issuer ID
    const smartContractSharesId = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFXIB";
    const smartContractShares = Array.from(ISSUER.entries())
        .filter(([, id]) => id === smartContractSharesId)
        .map(([name]) => name)
        .sort();

    // Tokens - all other assets
    const tokens = Array.from(ISSUER.entries())
        .filter(([, id]) => id !== smartContractSharesId)
        .map(([name, id]) => ({ name, id }))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Format identifier string with line breaks for better display
    const formatIdentifier = (id: string) => {
        // Split into chunks of ~20 characters for better readability
        const chunks: string[] = [];
        for (let i = 0; i < id.length; i += 20) {
            chunks.push(id.slice(i, i + 20));
        }
        return chunks.join(" ");
    };

    return (
        <main className="relative isolate flex min-h-[calc(100vh-140px)] w-full justify-center bg-background px-4 py-8 text-foreground sm:px-6 lg:px-10">
            <div className="relative z-10 w-full max-w-6xl">
                <h1 className="text-center text-4xl font-bold text-foreground mb-8">QX Assets</h1>

                {/* Smart Contract Shares Section */}
                <section className="mb-12">
                    <h2 className="text-center text-2xl font-semibold text-foreground mb-6">Smart Contract Shares</h2>
                    <div className="flex flex-wrap justify-center gap-2">
                        {smartContractShares.map((name) => {
                            const id = ISSUER.get(name) || "";
                            return (
                                <Link to={`/qx-assets/${id}/${name}`}>
                                    <Card key={name} className="w-40 rounded-lg border-border bg-card hover:border-primary/50 transition-colors">
                                        <CardContent className="p-4">
                                            <div className="space-y-2">
                                                <h3 className="text-center font-semibold text-xl text-card-foreground">{name}</h3>
                                                <p className="text-center text-xs text-muted-foreground break-all font-mono leading-relaxed">
                                                    {formatIdentifier(id)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Tokens Section */}
                <section>
                    <h2 className="text-center text-2xl font-semibold text-foreground mb-6">Tokens</h2>
                    <div className="flex flex-wrap justify-center gap-2">
                        {tokens.map(({ name, id }) => (
                            <Link to={`/qx-assets/${id}/${name}`}>
                                <Card key={name} className="w-40 rounded-lg border-border bg-card hover:border-primary/50 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            <h3 className="text-center font-semibold text-xl text-card-foreground">{name}</h3>
                                            <p className="text-center text-xs text-muted-foreground break-all font-mono leading-relaxed">
                                                {formatIdentifier(id)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default QXAssets;