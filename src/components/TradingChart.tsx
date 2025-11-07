import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area
} from 'recharts';
import { CandleData, calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } from '@/lib/technicalIndicators';

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
      time: new Date(candle.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
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

  const lastPrice = candles[candles.length - 1]?.close || 0;
  const priceChange = candles.length > 1 ? lastPrice - candles[0].close : 0;
  const priceChangePercent = candles.length > 1 ? (priceChange / candles[0].close) * 100 : 0;

  return (
    <Card className="p-6">
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

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--popover-foreground))'
            }}
          />
          <Legend />
          
          {/* Bollinger Bands */}
          <Area 
            type="monotone" 
            dataKey="bbUpper" 
            stroke="hsl(var(--muted))" 
            fill="hsl(var(--muted))"
            fillOpacity={0.1}
            name="BB Upper"
          />
          <Area 
            type="monotone" 
            dataKey="bbLower" 
            stroke="hsl(var(--muted))" 
            fill="hsl(var(--muted))"
            fillOpacity={0.1}
            name="BB Lower"
          />
          
          {/* Price Line */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            name="Price"
          />
          
          {/* Moving Averages */}
          <Line 
            type="monotone" 
            dataKey="sma20" 
            stroke="hsl(var(--chart-1))" 
            strokeWidth={1.5}
            dot={false}
            name="SMA 20"
          />
          <Line 
            type="monotone" 
            dataKey="sma50" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={1.5}
            dot={false}
            name="SMA 50"
          />
          
          {/* Volume */}
          <Bar 
            dataKey="volume" 
            fill="hsl(var(--muted))" 
            fillOpacity={0.3}
            name="Volume"
            yAxisId="right"
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
        </ComposedChart>
      </ResponsiveContainer>

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
