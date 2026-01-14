import { useParams } from "react-router-dom";
import AssetOrders from "./components/AssetOrders";
import AssetTrades from "./components/AssetTrades";
import AssetTransfers from "./components/AssetTransfers";
import Chart from "./components/Chart";

const QXAssetDetail: React.FC = () => {

    const { issuer, asset } = useParams<{ issuer: string, asset: string }>();

    if (!issuer || !asset) {
        return null;
    }

    const panelClass =
        "flex w-full flex-col overflow-hidden";

    return (
        <main className="relative isolate flex min-h-[calc(100vh-140px)] w-full justify-center bg-background px-4 py-8 sm:px-6 lg:px-10">
            <div>
                <div className='flex flex-col p-1 mb-2 w-full'>
                    <div className="border-t border-b gap-2 items-center p-1">
                        <span className="text-xs text-muted-foreground font-mono break-all flex-1 text-center">Name: </span>
                        <span className="ml-3 text-sm font-bold text-foreground font-mono uppercase break-all flex-1 text-center">{asset}</span>   
                    </div>
                    <div className="border-t border-b gap-2 items-center p-1">
                        <span className="text-xs text-muted-foreground font-mono break-all flex-1 text-center">Issuer: </span>
                        <span className="ml-3 text-sm font-bold text-foreground font-mono uppercase break-all flex-1 text-center">{issuer}</span>
                    </div>
                </div>
                <div className="relative z-10 grid w-full max-w-6xl gap-6 lg:grid-cols-2">
                    <section className={`${panelClass} h-[240px] lg:col-span-2`}>
                        <Chart className="relative inset-0 p-2" issuer={issuer} asset={asset} />
                    </section>
                    <section className={`${panelClass} h-[240px]`}>
                        <AssetOrders issuer={issuer} asset={asset} type="asks" />
                    </section>
                    <section className={`${panelClass} h-[240px]`}>
                        <AssetOrders issuer={issuer} asset={asset} type="bids" />
                    </section>
                    <section className={`${panelClass} h-[240px] lg:col-span-2`}>
                        <AssetTrades issuer={issuer} asset={asset} />
                    </section>
                    <section className={`${panelClass} h-[240px] lg:col-span-2`}>
                        <AssetTransfers issuer={issuer} asset={asset} />
                    </section>
                </div>
            </div>
        </main>
    );
};

export default QXAssetDetail;
