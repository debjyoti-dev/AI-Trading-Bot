import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Play, Pause, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BotControlsProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export function BotControls({ isActive, onToggle, settings, onSettingsChange }: BotControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('bot_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Bot settings have been updated successfully',
      });
      setShowSettings(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Trading Bot Control</h3>
          <p className="text-sm text-muted-foreground">Manage automated trading</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
        <div className="flex items-center gap-3">
          {isActive ? (
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          ) : (
            <div className="h-3 w-3 rounded-full bg-gray-400" />
          )}
          <div>
            <div className="font-semibold">
              {isActive ? 'Bot Active' : 'Bot Inactive'}
            </div>
            <div className="text-sm text-muted-foreground">
              {isActive ? 'Actively monitoring markets' : 'Trading paused'}
            </div>
          </div>
        </div>
        <Button
          onClick={() => onToggle(!isActive)}
          variant={isActive ? 'destructive' : 'default'}
          className="gap-2"
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4" /> Stop Bot
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Start Bot
            </>
          )}
        </Button>
      </div>

      {showSettings && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trading Capital (₹)</Label>
              <Input
                type="number"
                value={settings.trading_capital}
                onChange={(e) => onSettingsChange({ ...settings, trading_capital: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Position Size (₹)</Label>
              <Input
                type="number"
                value={settings.max_position_size}
                onChange={(e) => onSettingsChange({ ...settings, max_position_size: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Stop Loss (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.stop_loss_percentage}
                onChange={(e) => onSettingsChange({ ...settings, stop_loss_percentage: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Take Profit (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.take_profit_percentage}
                onChange={(e) => onSettingsChange({ ...settings, take_profit_percentage: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Daily Loss (₹)</Label>
              <Input
                type="number"
                value={settings.max_daily_loss}
                onChange={(e) => onSettingsChange({ ...settings, max_daily_loss: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Risk Per Trade (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.risk_per_trade}
                onChange={(e) => onSettingsChange({ ...settings, risk_per_trade: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Trading Strategy</Label>
              <Select 
                value={settings.strategy}
                onValueChange={(value) => onSettingsChange({ ...settings, strategy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rsi_macd">RSI + MACD</SelectItem>
                  <SelectItem value="bollinger">Bollinger Bands</SelectItem>
                  <SelectItem value="moving_average">Moving Average Crossover</SelectItem>
                  <SelectItem value="momentum">Momentum Trading</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-amber-500">Risk Warning</div>
              <div className="text-muted-foreground mt-1">
                Automated trading involves significant risk. Only use capital you can afford to lose.
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveSettings} className="flex-1">
              Save Settings
            </Button>
            <Button onClick={() => setShowSettings(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
