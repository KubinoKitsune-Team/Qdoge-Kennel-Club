import { cn, getCssVariableAsRgb } from "@/utils";
import type { ChartOptions, DeepPartial, IChartApi, ISeriesApi, SingleValueData, SolidColor } from "lightweight-charts";
import { createChart, HistogramSeries, LineSeries, CrosshairMode, PriceScaleMode } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { Loader2, LineChart, BarChart2, CandlestickChart } from "lucide-react";
import { formatQubicAmount } from "@/utils";

type ChartType = "candle" | "line" | "area";
type TimeFrame = "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

type Props = Readonly<{
  priceDataSeries: SingleValueData[];
  volumeDataSeries: SingleValueData[];
  className?: string;
  title?: string;
  symbol?: string;
  loading?: boolean;
  onTimeFrameChange?: (timeFrame: TimeFrame) => void;
  onChartTypeChange?: (chartType: ChartType) => void;
  showControls?: boolean;
  showTooltip?: boolean;
  theme?: "dark" | "light";
  HeaderComponent?: React.ReactElement;
}>;

// Chart type icon mapping
const chartTypeIcons = {
  line: <LineChart size={16} />,
  area: <BarChart2 size={16} />,
  candle: <CandlestickChart size={16} />,
};

export default function LightweightChart({
  priceDataSeries,
  volumeDataSeries,
  className,
  title = "Price Chart",
  symbol = "QCAP",
  loading = false,
  onTimeFrameChange,
  onChartTypeChange,
  showControls = true,
  showTooltip = true,
  theme = "dark",
  HeaderComponent,
}: Props) {
  const [colors, setColors] = useState({
    primaryColor: getCssVariableAsRgb("--primary"),
    secondaryColor: getCssVariableAsRgb("--secondary"),
    backgroundColor: getCssVariableAsRgb("--background"),
    textColor: getCssVariableAsRgb("--foreground"),
  });

  // Create the chart instance
  const CHART_OPTIONS: DeepPartial<ChartOptions> = {
    layout: {
      textColor: colors.textColor,
      attributionLogo: false,
      background: { type: "solid", color: colors.backgroundColor } as SolidColor,
    },
    rightPriceScale: { visible: true, borderVisible: false },
    leftPriceScale: { visible: true, borderVisible: false },
    grid: {
      vertLines: {
        color: "#2B3A4A",
        style: 1,
        visible: true,
      },
      horzLines: {
        color: "#2B3A4A",
        style: 1,
        visible: true,
      },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        width: 1,
        color: "#3b82f6",
        style: 1,
        labelBackgroundColor: "#3b82f6",
      },
      horzLine: {
        width: 1,
        color: "#3b82f6",
        style: 1,
        labelBackgroundColor: "#3b82f6",
      },
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
    },
  };

  const LIGHT_THEME = {
    layout: {
      textColor: "#333",
      background: { type: "solid", color: "#ffffff" } as SolidColor,
    },
    grid: {
      vertLines: {
        color: "#f0f0f0",
      },
      horzLines: {
        color: "#f0f0f0",
      },
    },
  };

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const priceSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [currentVolume, setCurrentVolume] = useState<number | null>(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>("1h");
  const [selectedChartType, setSelectedChartType] = useState<ChartType>("line");
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    setColors({
      primaryColor: getCssVariableAsRgb("--primary"),
      secondaryColor: getCssVariableAsRgb("--secondary"),
      backgroundColor: getCssVariableAsRgb("--background"),
      textColor: getCssVariableAsRgb("--foreground"),
    });

    const container = chartContainerRef.current;
    const parentElement = container.parentElement;

    // Get parent dimensions
    const width = parentElement?.offsetWidth || container.offsetWidth;
    const height = parentElement?.offsetHeight || container.offsetHeight;

    const themeOptions = theme === "light" ? LIGHT_THEME : {};

    const chart = createChart(container, {
      ...CHART_OPTIONS,
      ...themeOptions,
      width,
      height,
    });
    chartRef.current = chart;

    // Create price series
    const priceSeries = chart.addSeries(LineSeries);
    priceSeries.applyOptions({
      lineWidth: 2,
      color: colors.primaryColor,
      priceFormat: { type: "price", precision: 1, minMove: 0.1 },
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineWidth: 1,
      priceLineColor: colors.primaryColor,
      priceLineStyle: 2,
    });
    priceSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.1, bottom: 0.2 },
      mode: PriceScaleMode.Normal,
    });
    priceSeries.setData(priceDataSeries);
    priceSeriesRef.current = priceSeries;

    chartRef.current?.timeScale().fitContent();
    chartRef.current?.timeScale().applyOptions({
      minBarSpacing: 1,
      fixLeftEdge: true,
      fixRightEdge: true,
      rightOffset: 0,
    });

    // Create volume series
    const volumeSeries = chart.addSeries(HistogramSeries);
    volumeSeries.applyOptions({
      priceFormat: { type: "volume" },
      priceScaleId: "left",
      color: colors.secondaryColor,
      base: 0,
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
      visible: true,
    });
    volumeSeries.setData(volumeDataSeries);
    volumeSeriesRef.current = volumeSeries;

    // Fit the content to the time scale
    chart.timeScale().fitContent();

    // Add crosshair move handler for tooltip
    if (showTooltip) {
      chart.subscribeCrosshairMove((param) => {
        if (param.time) {
          const price = param.seriesData.get(priceSeries);
          const volume = param.seriesData.get(volumeSeries);

          if (price) setCurrentPrice(Number(price));
          if (volume) setCurrentVolume(Number(volume));
        } else {
          setCurrentPrice(null);
          setCurrentVolume(null);
        }
      });
    }

    // Use ResizeObserver for responsiveness
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && parentElement) {
        const newWidth = parentElement.offsetWidth;
        const newHeight = parentElement.offsetHeight;
        chartRef.current.resize(newWidth, newHeight);
        chartRef.current.timeScale().fitContent();
      }
    });

    if (parentElement) {
      resizeObserver.observe(parentElement);
    }

    // eslint-disable-next-line consistent-return -- Cleanup
    return () => {
      chart.remove();
      chartRef.current = null;
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Update price data series
  useEffect(() => {
    if (priceSeriesRef.current && priceDataSeries.length > 0) {
      priceSeriesRef.current.setData(priceDataSeries);
      chartRef.current?.timeScale().fitContent();

      // Calculate price change
      if (priceDataSeries.length >= 2) {
        const firstPrice = priceDataSeries[0].value;
        const lastPrice = priceDataSeries[priceDataSeries.length - 1].value;
        const change = lastPrice - firstPrice;
        const changePercent = (change / firstPrice) * 100;

        setPriceChange(change);
        setPriceChangePercent(changePercent);
      }
    }
  }, [priceDataSeries]);

  // Update volume data series
  useEffect(() => {
    if (volumeSeriesRef.current && volumeDataSeries.length > 0) {
      volumeSeriesRef.current.setData(volumeDataSeries);
      chartRef.current?.timeScale().fitContent();
    }
  }, [volumeDataSeries]);

  // Handle time frame change
  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    setSelectedTimeFrame(timeFrame);
    if (onTimeFrameChange) {
      onTimeFrameChange(timeFrame);
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (chartType: ChartType) => {
    setSelectedChartType(chartType);
    if (onChartTypeChange) {
      onChartTypeChange(chartType);
    }
  };

  return (
    <div className={cn("relative flex h-full w-full flex-col", className)}>
      {/* Chart Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 pt-0 dark:border-gray-800">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{symbol}</h3>
            <span className={cn("text-sm", priceChange >= 0 ? "text-green-500" : "text-red-500")}>
              {priceChangePercent >= 0 ? "+" : ""}
              {priceChangePercent.toFixed(2)}%
            </span>
          </div>
          <p className="text-sm text-gray-500">{title}</p>
        </div>

        <div className="flex items-center gap-2">{HeaderComponent ? HeaderComponent : null}</div>

        {showControls && (
          <div className="flex gap-2">
            <div className="flex border">
              {(["5m", "15m", "1h", "4h", "1d", "1w"] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  className={cn(
                    "rounded-none px-2 py-1 text-xs",
                    selectedTimeFrame === tf ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                  onClick={() => handleTimeFrameChange(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex rounded-md border">
              {(["line", "area", "candle"] as ChartType[]).map((type) => (
                <button
                  key={type}
                  className={cn(
                    "flex items-center gap-1 rounded-none px-2 py-1 text-xs capitalize",
                    selectedChartType === type ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                  onClick={() => handleChartTypeChange(type)}
                >
                  {chartTypeIcons[type]}
                  <span>{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {showTooltip && currentPrice && (
          <div className="absolute right-3 top-3 z-10 rounded bg-gray-800 p-2 text-xs text-white">
            <div>Price: {formatQubicAmount(currentPrice)}</div>
            {currentVolume && <div>Volume: {currentVolume.toLocaleString()}</div>}
          </div>
        )}

        <div
          ref={chartContainerRef}
          className="h-full w-full"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </div>
    </div>
  );
}
