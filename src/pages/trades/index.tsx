import Tokens from "./components/Tokens";
import SCShares from "./components/SCShares";

const Trades: React.FC = () => {

    const panelClass =
        "flex w-full flex-col overflow-hidden";

    return (
        <main className="relative isolate flex min-h-[calc(100vh-140px)] w-full justify-center bg-background px-4 py-8 sm:px-6 lg:px-10">
            <div>
                <div className='flex items-center justify-center gap-2 p-1 mb-4 w-full'>
                    <span className="text-2xl font-bold text-foreground font-mono uppercase break-all flex-1 text-center">Latest Trades</span>
                </div>
                <div className="relative z-10 grid w-full max-w-6xl gap-6">
                    <section className={`${panelClass} h-[320px]`}>
                        <Tokens />
                    </section>
                    <section className={`${panelClass} h-[320px]`}>
                        <SCShares />
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Trades;
