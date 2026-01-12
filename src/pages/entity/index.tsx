import { useParams } from "react-router-dom";
import OrderEntity from "./components/OrderEntity";
import TradeHistory from "./components/TradeHistory";
import AssetsTransfer from "./components/AssetsTransfer";

const Entity: React.FC = () => {

    const { entity } = useParams<{ entity: string }>();

    if (!entity) {
        return null;
    }

    const panelClass =
        "flex w-full flex-col overflow-hidden";

    return (
        <main className="relative isolate flex min-h-[calc(100vh-140px)] w-full justify-center bg-background px-4 py-8 sm:px-6 lg:px-10">
            <div className="relative z-10 grid w-full max-w-6xl gap-6 lg:grid-cols-2">
                <section className={`${panelClass} h-[240px]`}>
                    <OrderEntity entity={entity} type="asks" />
                </section>
                <section className={`${panelClass} h-[240px]`}>
                    <OrderEntity entity={entity} type="bids" />
                </section>
                <section className={`${panelClass} h-[240px] lg:col-span-2`}>
                    <TradeHistory entity={entity} />
                </section>
                <section className={`${panelClass} h-[240px] lg:col-span-2`}>
                    <AssetsTransfer entity={entity} />
                </section>
            </div>
        </main>
    );
};

export default Entity;
