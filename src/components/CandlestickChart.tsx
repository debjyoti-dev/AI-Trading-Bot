import { useEffect, useRef, memo } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType, CandlestickSeries } from 'lightweight-charts';

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandleData[];
  height?: number;
}

const CandlestickChart = memo(({ data, height = 400 }: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with dark trading terminal style
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'hsl(222, 47%, 8%)' },
        textColor: 'hsl(215, 20%, 65%)',
      },
      grid: {
        vertLines: { color: 'hsl(222, 30%, 15%)' },
        horzLines: { color: 'hsl(222, 30%, 15%)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'hsl(215, 20%, 45%)',
          width: 1,
          style: 2,
          labelBackgroundColor: 'hsl(222, 47%, 15%)',
        },
        horzLine: {
          color: 'hsl(215, 20%, 45%)',
          width: 1,
          style: 2,
          labelBackgroundColor: 'hsl(222, 47%, 15%)',
        },
      },
      rightPriceScale: {
        borderColor: 'hsl(222, 30%, 20%)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: 'hsl(222, 30%, 20%)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    });

    chartRef.current = chart;

    // Add candlestick series with professional colors (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height]);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !data.length) return;

    // Convert data format for lightweight-charts
    const formattedData: CandlestickData[] = data.map((item) => ({
      time: item.time as unknown as CandlestickData['time'],
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    seriesRef.current.setData(formattedData);
    
    // Fit content to view
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full rounded-lg overflow-hidden border border-border/50"
      style={{ minHeight: height }}
    />
  );
});

CandlestickChart.displayName = 'CandlestickChart';

export default CandlestickChart;
