-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL NOT NULL,
  entry_price DECIMAL NOT NULL,
  exit_price DECIMAL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  pnl DECIMAL DEFAULT 0,
  pnl_percentage DECIMAL DEFAULT 0,
  strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Create portfolio table
CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  avg_price DECIMAL NOT NULL,
  current_price DECIMAL NOT NULL,
  pnl DECIMAL DEFAULT 0,
  pnl_percentage DECIMAL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Create bot_settings table
CREATE TABLE IF NOT EXISTS public.bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  trading_capital DECIMAL NOT NULL DEFAULT 100000,
  max_position_size DECIMAL NOT NULL DEFAULT 10000,
  stop_loss_percentage DECIMAL NOT NULL DEFAULT 2,
  take_profit_percentage DECIMAL NOT NULL DEFAULT 5,
  max_daily_loss DECIMAL NOT NULL DEFAULT 5000,
  risk_per_trade DECIMAL NOT NULL DEFAULT 1,
  strategy TEXT NOT NULL DEFAULT 'rsi_macd',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create signals table
CREATE TABLE IF NOT EXISTS public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
  price DECIMAL NOT NULL,
  rsi DECIMAL,
  macd DECIMAL,
  signal_line DECIMAL,
  indicators JSONB,
  confidence DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trades
CREATE POLICY "Users can view their own trades"
  ON public.trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades"
  ON public.trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON public.trades FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for portfolio
CREATE POLICY "Users can view their own portfolio"
  ON public.portfolio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own portfolio"
  ON public.portfolio FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for bot_settings
CREATE POLICY "Users can view their own settings"
  ON public.bot_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
  ON public.bot_settings FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for signals
CREATE POLICY "Users can view their own signals"
  ON public.signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own signals"
  ON public.signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_created_at ON public.trades(created_at DESC);
CREATE INDEX idx_portfolio_user_id ON public.portfolio(user_id);
CREATE INDEX idx_signals_user_id ON public.signals(user_id);
CREATE INDEX idx_signals_created_at ON public.signals(created_at DESC);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_bot_settings_updated_at
  BEFORE UPDATE ON public.bot_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_portfolio_updated_at
  BEFORE UPDATE ON public.portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();