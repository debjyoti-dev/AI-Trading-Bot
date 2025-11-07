// Mock Market Data Generator for Demo Purposes
import { CandleData } from './technicalIndicators';

export function generateMockCandles(symbol: string, count: number = 100): CandleData[] {
  const candles: CandleData[] = [];
  let basePrice = 50000; // Base price for INR
  
  // Adjust base price based on symbol
  if (symbol.includes('ETH')) basePrice = 180000;
  if (symbol.includes('BNB')) basePrice = 25000;
  if (symbol.includes('TCS')) basePrice = 3500;
  if (symbol.includes('RELIANCE')) basePrice = 2500;
  
  const now = Date.now();
  const interval = 5 * 60 * 1000; // 5 minutes
  
  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * interval;
    const volatility = basePrice * 0.02;
    const trend = Math.sin(i / 10) * volatility;
    
    const open = basePrice + trend;
    const close = open + (Math.random() - 0.5) * volatility * 2;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 1000000 + 500000;
    
    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume
    });
    
    basePrice = close;
  }
  
  return candles;
}

export function updateLastCandle(candles: CandleData[]): CandleData[] {
  if (candles.length === 0) return candles;
  
  const lastCandle = candles[candles.length - 1];
  const volatility = lastCandle.close * 0.01;
  const priceChange = (Math.random() - 0.5) * volatility;
  
  const newClose = lastCandle.close + priceChange;
  const newHigh = Math.max(lastCandle.high, newClose);
  const newLow = Math.min(lastCandle.low, newClose);
  
  const updatedCandles = [...candles];
  updatedCandles[updatedCandles.length - 1] = {
    ...lastCandle,
    close: newClose,
    high: newHigh,
    low: newLow,
    volume: lastCandle.volume + Math.random() * 10000
  };
  
  return updatedCandles;
}

export const AVAILABLE_SYMBOLS = [
  { symbol: 'BTC/INR', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH/INR', name: 'Ethereum', type: 'crypto' },
  { symbol: 'BNB/INR', name: 'Binance Coin', type: 'crypto' },
  { symbol: 'TCS.NSE', name: 'TCS', type: 'stock' },
  { symbol: 'RELIANCE.NSE', name: 'Reliance', type: 'stock' },
  { symbol: 'USD/INR', name: 'US Dollar', type: 'forex' },
];
