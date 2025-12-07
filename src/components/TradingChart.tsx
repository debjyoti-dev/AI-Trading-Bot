import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { CandleData, calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } from '@/lib/technicalIndicators';
import CandlestickChart from './CandlestickChart';

interface TradingChartProps {
  candles: CandleData[];
  symbol: string;
}

export function TradingChart({ candles, symbol }: TradingChartProps) {
  const chartData = useMemo(() => {
    const closePrices = candles.map(c => c.close);
    const sma20 = calculateSMA(closePrices, 20);
    const sma50 = calculateSMA(closePrices, 50);
    const rsi = calculateRSI(closePrices);
    const macd = calculateMACD(closePrices);
    const bb = calculateBollingerBands(closePrices);

    return candles.map((candle, i) => ({
      time: new Date(candle.timestamp).toISOString().split('T')[0], // Format as YYYY-MM-DD for lightweight-charts
      price: candle.close,
      high: candle.high,
      low: candle.low,
      open: candle.open,
      volume: candle.volume,
      sma20: sma20[i],
      sma50: sma50[i],
      rsi: rsi[i],
      macd: macd.macdLine[i],
      signal: macd.signalLine[i],
      bbUpper: bb.upper[i],
      bbLower: bb.lower[i],
      bbMiddle: bb.middle[i],
    }));
  }, [candles]);

  // Prepare data for CandlestickChart component
  const candlestickData = useMemo(() => {
    return chartData.map(item => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.price,
    }));
  }, [chartData]);

  const lastPrice = candles[candles.length - 1]?.close || 0;
  const priceChange = candles.length > 1 ? lastPrice - candles[0].close : 0;
  const priceChangePercent = candles.length > 1 ? (priceChange / candles[0].close) * 100 : 0;

  return (
    <Card className="p-6 bg-card">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{symbol}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-bold">₹{lastPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              <span className={`text-lg ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toLocaleString('en-IN', { maximumFractionDigits: 2 })} 
                ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Candlestick Chart */}
      <CandlestickChart data={candlestickData} height={400} />

      {/* Technical Indicators Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-3 border rounded-lg">
          <div className="text-sm text-muted-foreground">RSI (14)</div>
          <div className={`text-xl font-bold ${
            chartData[chartData.length - 1]?.rsi > 70 ? 'text-red-600' : 
            chartData[chartData.length - 1]?.rsi < 30 ? 'text-green-600' : 
            'text-foreground'
          }`}>
            {chartData[chartData.length - 1]?.rsi?.toFixed(2) || 'N/A'}
          </div>
        </div>
        <div className="p-3 border rounded-lg">
          <div className="text-sm text-muted-foreground">MACD</div>
          <div className="text-xl font-bold">
            {chartData[chartData.length - 1]?.macd?.toFixed(2) || 'N/A'}
          </div>
        </div>
        <div className="p-3 border rounded-lg">
          <div className="text-sm text-muted-foreground">SMA 20</div>
          <div className="text-xl font-bold">
            ₹{chartData[chartData.length - 1]?.sma20?.toFixed(2) || 'N/A'}
          </div>
        </div>
        <div className="p-3 border rounded-lg">
          <div className="text-sm text-muted-foreground">SMA 50</div>
          <div className="text-xl font-bold">
            ₹{chartData[chartData.length - 1]?.sma50?.toFixed(2) || 'N/A'}
          </div>
        </div>
      </div>
    </Card>
  );
}
