import LightweightChart from "@/components/LightweightChart";
import { fetchAssetChartAveragePrice } from "@/services/api.service";
import { cn } from "@/utils";
import { useAtom } from "jotai";
import type { SingleValueData, Time } from "lightweight-charts";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { settingsAtom } from "@/store/settings";

type TimeFrame = "5m" | "15m" | "1h" | "4h" | "1d" | "1w";
type ChartType = "line" | "area" | "candle";


const Chart: React.FC<{ className: string, issuer: string, asset: string } & React.HTMLAttributes<HTMLDivElement>> = ({ className, issuer, asset, ...props }) => {
  const [priceData, setPriceData] = useState<SingleValueData[]>([]);
  const [volumeData, setVolumeData] = useState<SingleValueData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1h");
  const [, setChartType] = useState<ChartType>("line");
  const [settings] = useAtom(settingsAtom);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchAssetChartAveragePrice(issuer, asset);

        const avgPriceData: SingleValueData[] =
          res?.map((v) => ({
            value: v.averagePrice,
            time: v.time as Time,
          })) ?? [];

        const histogramVolumeData: SingleValueData[] =
          res?.map((v) => ({
            value: v.totalAmount,
            time: v.time as Time,
          })) ?? [];

        setPriceData(avgPriceData);
        setVolumeData(histogramVolumeData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asset, timeFrame]);

  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  const handleChartTypeChange = (newChartType: ChartType) => {
    setChartType(newChartType);
  };

  if (loading && priceData.length === 0) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center", className)} {...props}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full", className)} {...props}>
      <LightweightChart
        priceDataSeries={priceData}
        volumeDataSeries={volumeData}
        className="h-full"
        title={`Chart`}
        symbol={asset}
        loading={loading}
        showControls={false}
        showTooltip={true}
        theme={settings.darkMode ? "dark" : "light"}
        onTimeFrameChange={handleTimeFrameChange}
        onChartTypeChange={handleChartTypeChange}
      />
    </div>
  );
};

export default Chart;
