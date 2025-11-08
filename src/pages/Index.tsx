import { useState, useEffect } from 'react';
import { TradingChart } from '@/components/TradingChart';
import { BotControls } from '@/components/BotControls';
import { Portfolio } from '@/components/Portfolio';
import { TradeHistory } from '@/components/TradeHistory';
import { SignalFeed } from '@/components/SignalFeed';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateMockCandles, updateLastCandle, AVAILABLE_SYMBOLS } from '@/lib/mockMarketData';
import { generateSignal } from '@/lib/technicalIndicators';
import { Activity, TrendingUp, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
const Index = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/INR');
  const [candles, setCandles] = useState(generateMockCandles(selectedSymbol, 100));
  const [isBotActive, setIsBotActive] = useState(false);
  const [settings, setSettings] = useState({
    trading_capital: 100000,
    max_position_size: 10000,
    stop_loss_percentage: 2,
    take_profit_percentage: 5,
    max_daily_loss: 5000,
    risk_per_trade: 1,
    strategy: 'rsi_macd'
  });
  const [portfolio, setPortfolio] = useState([]);
  const [trades, setTrades] = useState([]);
  const [signals, setSignals] = useState([]);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const {
    toast
  } = useToast();

  // Check authentication
  useEffect(() => {
    supabase.auth.getUser().then(({
      data: {
        user
      }
    }) => {
      setUser(user);
      if (user) {
        loadUserData(user.id);
      }
    });
  }, []);
  const loadUserData = async (userId: string) => {
    // Load bot settings
    const {
      data: settingsData
    } = await supabase.from('bot_settings').select('*').eq('user_id', userId).single();
    if (settingsData) {
      setSettings(settingsData);
      setIsBotActive(settingsData.is_active);
    }

    // Load portfolio
    const {
      data: portfolioData
    } = await supabase.from('portfolio').select('*').eq('user_id', userId);
    if (portfolioData) setPortfolio(portfolioData);

    // Load trades
    const {
      data: tradesData
    } = await supabase.from('trades').select('*').eq('user_id', userId).order('created_at', {
      ascending: false
    }).limit(20);
    if (tradesData) setTrades(tradesData);

    // Load signals
    const {
      data: signalsData
    } = await supabase.from('signals').select('*').eq('user_id', userId).order('created_at', {
      ascending: false
    }).limit(20);
    if (signalsData) setSignals(signalsData);
  };

  // Real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCandles(prev => updateLastCandle(prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-trading logic
  useEffect(() => {
    if (!isBotActive || !user) return;
    const interval = setInterval(async () => {
      const signal = generateSignal(candles);

      // Store signal
      await supabase.from('signals').insert({
        user_id: user.id,
        symbol: selectedSymbol,
        signal_type: signal.signal,
        price: candles[candles.length - 1].close,
        rsi: signal.indicators.rsi,
        macd: signal.indicators.macd,
        signal_line: signal.indicators.signalLine,
        confidence: signal.confidence
      });

      // Execute trade if confidence is high enough
      if (signal.confidence > 0.7) {
        toast({
          title: `${signal.signal.toUpperCase()} Signal`,
          description: `${selectedSymbol} - Confidence: ${(signal.confidence * 100).toFixed(0)}%`
        });
      }
      loadUserData(user.id);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isBotActive, candles, selectedSymbol, user]);

  // Handle symbol change
  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    setCandles(generateMockCandles(symbol, 100));
  };

  // Handle bot toggle
  const handleBotToggle = async (active: boolean) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to use the trading bot',
        variant: 'destructive'
      });
      return;
    }
    setIsBotActive(active);
    await supabase.from('bot_settings').upsert({
      user_id: user.id,
      ...settings,
      is_active: active
    });
    toast({
      title: active ? 'Bot activated' : 'Bot deactivated',
      description: active ? 'Trading bot is now monitoring markets' : 'Trading bot has been paused'
    });
  };

  // Calculate portfolio metrics
  const totalValue = portfolio.reduce((sum, p) => sum + p.quantity * p.current_price, 0);
  const totalPnL = portfolio.reduce((sum, p) => sum + p.pnl, 0);
  const todayPnL = trades.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()).reduce((sum, t) => sum + (t.pnl || 0), 0);
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Activity className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-4xl font-bold">INR Trading Bot</h1>
          <p className="text-muted-foreground max-w-md">
            Please sign in to access your trading dashboard and start automated trading
          </p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Trading Bot</h1>
              <p className="text-muted-foreground">AI-Powered Automated Trading</p>
            </div>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-[280px] justify-between">
                {selectedSymbol ? AVAILABLE_SYMBOLS.find(s => s.symbol === selectedSymbol)?.name : "Select symbol..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0">
              <Command>
                <CommandInput placeholder="Search symbols..." />
                <CommandList>
                  <CommandEmpty>No symbol found.</CommandEmpty>
                  <CommandGroup heading="Crypto">
                    {AVAILABLE_SYMBOLS.filter(s => s.type === 'crypto').map(s => <CommandItem key={s.symbol} value={s.symbol} onSelect={() => {
                    handleSymbolChange(s.symbol);
                    setOpen(false);
                  }}>
                        <Check className={cn("mr-2 h-4 w-4", selectedSymbol === s.symbol ? "opacity-100" : "opacity-0")} />
                        {s.name} ({s.symbol})
                      </CommandItem>)}
                  </CommandGroup>
                  <CommandGroup heading="Stocks">
                    {AVAILABLE_SYMBOLS.filter(s => s.type === 'stock').map(s => <CommandItem key={s.symbol} value={s.symbol} onSelect={() => {
                    handleSymbolChange(s.symbol);
                    setOpen(false);
                  }}>
                        <Check className={cn("mr-2 h-4 w-4", selectedSymbol === s.symbol ? "opacity-100" : "opacity-0")} />
                        {s.name} ({s.symbol})
                      </CommandItem>)}
                  </CommandGroup>
                  <CommandGroup heading="Index">
                    {AVAILABLE_SYMBOLS.filter(s => s.type === 'index').map(s => <CommandItem key={s.symbol} value={s.symbol} onSelect={() => {
                    handleSymbolChange(s.symbol);
                    setOpen(false);
                  }}>
                        <Check className={cn("mr-2 h-4 w-4", selectedSymbol === s.symbol ? "opacity-100" : "opacity-0")} />
                        {s.name}
                      </CommandItem>)}
                  </CommandGroup>
                  <CommandGroup heading="Nifty Options">
                    {AVAILABLE_SYMBOLS.filter(s => s.type === 'option').map(s => <CommandItem key={s.symbol} value={s.symbol} onSelect={() => {
                    handleSymbolChange(s.symbol);
                    setOpen(false);
                  }}>
                        <Check className={cn("mr-2 h-4 w-4", selectedSymbol === s.symbol ? "opacity-100" : "opacity-0")} />
                        {s.name}
                      </CommandItem>)}
                  </CommandGroup>
                  <CommandGroup heading="Forex">
                    {AVAILABLE_SYMBOLS.filter(s => s.type === 'forex').map(s => <CommandItem key={s.symbol} value={s.symbol} onSelect={() => {
                    handleSymbolChange(s.symbol);
                    setOpen(false);
                  }}>
                        <Check className={cn("mr-2 h-4 w-4", selectedSymbol === s.symbol ? "opacity-100" : "opacity-0")} />
                        {s.name} ({s.symbol})
                      </CommandItem>)}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Main Chart */}
        <TradingChart candles={candles} symbol={selectedSymbol} />

        {/* Bot Controls */}
        <BotControls isActive={isBotActive} onToggle={handleBotToggle} settings={settings} onSettingsChange={setSettings} />

        {/* Portfolio */}
        <Portfolio positions={portfolio} totalValue={totalValue} totalPnL={totalPnL} todayPnL={todayPnL} />

        {/* Signals and Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SignalFeed signals={signals} />
          <TradeHistory trades={trades} />
        </div>
      </div>
    </div>;
};
export default Index;