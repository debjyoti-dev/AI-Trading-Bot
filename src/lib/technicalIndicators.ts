// Technical Indicators Calculations

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Simple Moving Average
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

// Exponential Moving Average
export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  const firstSMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(firstSMA);
  
  for (let i = period; i < data.length; i++) {
    const currentEMA = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(currentEMA);
  }
  
  return Array(period - 1).fill(NaN).concat(ema);
}

// Relative Strength Index
export function calculateRSI(data: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  // First RSI calculation
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(NaN);
      continue;
    }
    
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) {
      rsi.push(100);
      continue;
    }
    
    const rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  
  return rsi;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);
  
  const macdLine = emaFast.map((fast, i) => fast - emaSlow[i]);
  const signalLine = calculateEMA(macdLine.filter(v => !isNaN(v)), signalPeriod);
  const histogram = macdLine.map((macd, i) => macd - (signalLine[i] || 0));
  
  return { macdLine, signalLine: Array(macdLine.length - signalLine.length).fill(NaN).concat(signalLine), histogram };
}

// Bollinger Bands
export function calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(data, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upperBand.push(NaN);
      lowerBand.push(NaN);
      continue;
    }
    
    const slice = data.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    upperBand.push(mean + stdDev * std);
    lowerBand.push(mean - stdDev * std);
  }
  
  return { middle: sma, upper: upperBand, lower: lowerBand };
}

// Generate Trading Signal
export function generateSignal(candles: CandleData[]) {
  const closePrices = candles.map(c => c.close);
  const rsi = calculateRSI(closePrices);
  const macd = calculateMACD(closePrices);
  const bb = calculateBollingerBands(closePrices);
  
  const lastRSI = rsi[rsi.length - 1];
  const lastMACD = macd.macdLine[macd.macdLine.length - 1];
  const lastSignal = macd.signalLine[macd.signalLine.length - 1];
  const lastClose = closePrices[closePrices.length - 1];
  const lastUpper = bb.upper[bb.upper.length - 1];
  const lastLower = bb.lower[bb.lower.length - 1];
  
  let signal: 'buy' | 'sell' | 'hold' = 'hold';
  let confidence = 0;
  
  // Buy signals
  if (lastRSI < 30 && lastMACD > lastSignal && lastClose < lastLower) {
    signal = 'buy';
    confidence = 0.85;
  } else if (lastRSI < 40 && lastMACD > lastSignal) {
    signal = 'buy';
    confidence = 0.65;
  }
  
  // Sell signals
  else if (lastRSI > 70 && lastMACD < lastSignal && lastClose > lastUpper) {
    signal = 'sell';
    confidence = 0.85;
  } else if (lastRSI > 60 && lastMACD < lastSignal) {
    signal = 'sell';
    confidence = 0.65;
  }
  
  return {
    signal,
    confidence,
    indicators: {
      rsi: lastRSI,
      macd: lastMACD,
      signalLine: lastSignal,
      bbUpper: lastUpper,
      bbLower: lastLower,
    }
  };
}
