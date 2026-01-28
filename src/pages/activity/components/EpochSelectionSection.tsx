import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/utils";

interface EpochSelectionSectionProps {
  epochs: number[];
  selectedEpoch: number | null;
  expandedEpochs: Set<number>;
  onEpochSelect: (epoch: number) => void;
}

const EpochSelectionSection: React.FC<EpochSelectionSectionProps> = ({
  epochs, selectedEpoch, expandedEpochs, onEpochSelect,
}) => (
  <motion.section
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="flex w-full md:w-[140px] md:min-w-[140px] lg:w-[180px] lg:min-w-[180px] flex-col border-b md:border-b-0 md:border-r border-border bg-card h-auto md:h-full relative z-10"
  >
    <div className="border-b border-border bg-muted/30 px-4 py-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">Epoch</h2>
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent max-h-[200px] md:max-h-none">
      <div className="grid grid-cols-3 xs:grid-cols-4 md:flex md:flex-col gap-2 p-3">
        {epochs.map((epoch) => {
          const isSelected = selectedEpoch === epoch;
          const isExpanded = expandedEpochs.has(epoch);
          return (
            <motion.button
              key={epoch}
              onClick={() => onEpochSelect(epoch)}
              className={cn(
                "group relative flex items-center justify-center md:justify-start gap-2 rounded-md px-3 py-2.5 md:py-2 transition-all duration-200 hover:bg-muted/40",
                isSelected
                  ? "bg-muted/20 text-foreground border-2 border-primary shadow-sm"
                  : "text-foreground border border-border md:border-2 md:border-transparent hover:border-primary/50"
              )}
              whileTap={{ scale: 0.98 }}
            >
              <div className="hidden md:flex h-4 w-4 items-center justify-center flex-shrink-0">
                {isExpanded ? (
                  <Minus size={14} className="text-primary" />
                ) : (
                  <Plus size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </div>
              <span className="font-mono text-sm font-semibold">{epoch}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  </motion.section>
);

export default EpochSelectionSection;
