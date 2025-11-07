import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface PortfolioProps {
  positions: any[];
  totalValue: number;
  totalPnL: number;
  todayPnL: number;
}

export function Portfolio({ positions, totalValue, totalPnL, todayPnL }: PortfolioProps) {
  const pnlPercentage = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">Portfolio Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Total Value</span>
          </div>
          <div className="text-2xl font-bold">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Activity className="h-4 w-4" />
            <span className="text-sm">Total P&L</span>
          </div>
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            <span className="text-base ml-2">({pnlPercentage.toFixed(2)}%)</span>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            {todayPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="text-sm">Today's P&L</span>
          </div>
          <div className={`text-2xl font-bold ${todayPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {todayPnL >= 0 ? '+' : ''}₹{todayPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">P&L %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No open positions
                </TableCell>
              </TableRow>
            ) : (
              positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.symbol}</TableCell>
                  <TableCell className="text-right">{position.quantity}</TableCell>
                  <TableCell className="text-right">
                    ₹{position.avg_price.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{position.current_price.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className={`text-right ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className={`text-right ${position.pnl_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {position.pnl_percentage >= 0 ? '+' : ''}{position.pnl_percentage.toFixed(2)}%
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
