import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SignalFeedProps {
  signals: any[];
}

export function SignalFeed({ signals }: SignalFeedProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Trading Signals</h3>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {signals.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No signals generated yet
            </div>
          ) : (
            signals.map((signal) => (
              <div key={signal.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {signal.signal_type === 'buy' && (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    )}
                    {signal.signal_type === 'sell' && (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    {signal.signal_type === 'hold' && (
                      <Minus className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <div className="font-semibold">{signal.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(signal.created_at).toLocaleTimeString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      signal.signal_type === 'buy' ? 'default' : 
                      signal.signal_type === 'sell' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {signal.signal_type.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <span className="ml-2 font-semibold">
                      ₹{signal.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="ml-2 font-semibold">
                      {(signal.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  {signal.rsi && (
                    <div>
                      <span className="text-muted-foreground">RSI:</span>
                      <span className="ml-2 font-semibold">{signal.rsi.toFixed(2)}</span>
                    </div>
                  )}
                  {signal.macd && (
                    <div>
                      <span className="text-muted-foreground">MACD:</span>
                      <span className="ml-2 font-semibold">{signal.macd.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {signal.confidence < 0.5 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Low confidence signal</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
