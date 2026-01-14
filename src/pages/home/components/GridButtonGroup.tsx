import { Gem, ChartCandlestick, ArrowRightLeft} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GridButtonGroup: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div className="flex gap-4 xs:flex-row flex-col items-center justify-center">
            <button
                type="button"
                onClick={() => navigate("/qx-assets")}
                className="group flex flex-col justify-center items-center gap-3 rounded-xl border border-border/50 bg-card/80 w-48 h-40 text-foreground shadow-lg shadow-primary/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                <Gem className="text-primary group-hover:text-primary/80 transition-all duration-300" size={48} />
                <span className="text-xl font-semibold">Assets</span>
            </button>

            <button
                type="button"
                onClick={() => navigate("/trades")}
                className="group flex flex-col justify-center items-center gap-3 rounded-xl border border-border/50 bg-card/80 w-48 h-40 text-foreground shadow-lg shadow-primary/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                <ChartCandlestick className="text-primary group-hover:text-primary/80 transition-all duration-300" size={48} />
                <span className="text-xl font-semibold">Trades</span>
            </button>

            <button
                type="button"
                onClick={() => navigate("/transactions")}
                className="group flex flex-col justify-center items-center gap-3 rounded-xl border border-border/50 bg-card/80 w-48 h-40 text-foreground shadow-lg shadow-primary/10 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                <ArrowRightLeft className="text-primary group-hover:text-primary/80 transition-all duration-300" size={48} />
                <span className="text-xl font-semibold">Transactions</span>
            </button>

        </div>
    );
};

export default GridButtonGroup;