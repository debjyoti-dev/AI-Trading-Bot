import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Customized
} from 'recharts';
import { CandleData, calculateSMA, calculateRSI, calculateMACD, calculateBollingerBands } from '@/lib/technicalIndicators';

// Custom Candlestick Layer
const CandlestickLayer = (props: any) => {
  const { formattedGraphicalItems, xAxisMap, yAxisMap, offset } = props;
  
  if (!xAxisMap || !yAxisMap || !formattedGraphicalItems || formattedGraphicalItems.length === 0) {
    return null;
  }
  
  const xAxis = Object.values(xAxisMap)[0] as any;
  const yAxis = Object.values(yAxisMap)[0] as any;
  
  if (!xAxis || !yAxis || !offset) return null;
  
  // Get the actual data
  const data = formattedGraphicalItems[0]?.props?.data || [];
  if (data.length === 0) return null;
  
  // Read offset correctly as left/top/width
  const { left: chartX, top: chartY, width: chartWidth } = offset;
  
  // Calculate band size and candle width
  const band = xAxis.bandSize ?? chartWidth / data.length;
  const candleWidth = Math.max(band * 0.6, 2);
  
  return (
    <g>
      {data.map((item: any, index: number) => {
        const { open, close, high, low } = item;
        
        // Null-safe check
        if ([open, close, high, low].some(v => v == null)) return null;
        
        // Calculate X position using xAxis scale
        const scaledX = typeof xAxis.scale === 'function'
          ? xAxis.scale(item.time)
          : (index / data.length) * chartWidth;
        const xPos = chartX + scaledX + (xAxis.bandSize ? xAxis.bandSize / 2 : band / 2);
        
        // Calculate Y positions using yAxis scale and chart top offset
        const yHigh = chartY + yAxis.scale(high);
        const yLow = chartY + yAxis.scale(low);
        const yOpen = chartY + yAxis.scale(open);
        const yClose = chartY + yAxis.scale(close);
        
        const isGreen = close >= open;
        const color = isGreen ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)';
        
        const bodyHeight = Math.abs(yClose - yOpen);
        const bodyY = Math.min(yOpen, yClose);
        
        return (
          <g key={`candle-${index}`}>
            {/* Wick */}
            <line
              x1={xPos}
              y1={yHigh}
              x2={xPos}
              y2={yLow}
              stroke={color}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={xPos - candleWidth / 2}
              y={bodyY}
              width={candleWidth}
              height={Math.max(bodyHeight, 1)}
              fill={color}
              stroke={color}
            />
          </g>
        );
      })}
    </g>
  );
};

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
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            domain={['auto', 'auto']}
            tickLine={false}
            orientation="right"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--popover-foreground))'
            }}
          />
          
          {/* Price Line with Area Fill */}
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#colorPrice)"
            dot={false}
          />
          
          {/* Moving Averages */}
          <Line 
            type="monotone" 
            dataKey="sma20" 
            stroke="hsl(217, 91%, 60%)" 
            strokeWidth={2}
            dot={false}
            name="SMA 20"
          />
          <Line 
            type="monotone" 
            dataKey="sma50" 
            stroke="hsl(271, 91%, 65%)" 
            strokeWidth={2}
            dot={false}
            name="SMA 50"
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
