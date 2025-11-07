import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TradeHistoryProps {
  trades: any[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">Recent Trades</h3>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Entry Price</TableHead>
              <TableHead className="text-right">Exit Price</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No trades yet
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>
                    {new Date(trade.created_at).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {trade.side === 'buy' ? (
                        <>
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-semibold">BUY</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-semibold">SELL</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{trade.quantity}</TableCell>
                  <TableCell className="text-right">
                    ₹{trade.entry_price.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    {trade.exit_price ? `₹${trade.exit_price.toLocaleString('en-IN')}` : '-'}
                  </TableCell>
                  <TableCell className={`text-right ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.pnl ? (
                      <>
                        {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toLocaleString('en-IN')}
                        <span className="text-xs ml-1">
                          ({trade.pnl_percentage >= 0 ? '+' : ''}{trade.pnl_percentage.toFixed(2)}%)
                        </span>
                      </>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.status === 'open' ? 'default' : 'secondary'}>
                      {trade.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
