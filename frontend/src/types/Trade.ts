export interface Trade {
  id: number;
  user_id: number;
  date: string;
  symbol: string;
  trade_type: 'long' | 'short';
  broker?: string;
  entry_price: number;
  exit_price: number;
  size: number;
  stop_loss?: number;
  take_profit?: number;
  strategy: string;
  notes?: string;
  screenshot_path?: string;
  profit_loss: number;
  profit_loss_percentage: number;
  risk_reward_ratio?: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: number;
  user_id: number;
  default_currency: string;
  default_timeframe: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradeAnalytics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  average_pnl: number;
  best_trade: Trade | null;
  worst_trade: Trade | null;
}

export interface PaginatedTrades {
  trades: Trade[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}