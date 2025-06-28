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
  
  // Enhanced Risk Management
  position_size_percent?: number;
  risk_per_trade?: number;
  risk_percent?: number;
  
  // Market Context
  market_condition?: 'bull' | 'bear' | 'sideways';
  volatility_index?: number;
  sector?: string;
  market_sentiment?: 'bullish' | 'bearish' | 'neutral';
  
  // Technical Analysis
  entry_reason?: string;
  exit_reason?: string;
  technical_indicators?: string;
  chart_patterns?: string;
  timeframe?: string;
  volume_confirmation?: boolean;
  
  // Emotional & Psychological Tracking
  emotional_state?: number; // 1-10 scale
  confidence_level?: number; // 1-10 scale
  stress_level?: number; // 1-10 scale
  setup_quality?: number; // 1-10 scale
  execution_quality?: number; // 1-10 scale
  
  // Trade Management
  holding_period?: number;
  partial_exits?: string;
  trailing_stop?: boolean;
  breakeven_stop?: boolean;
  
  // Lessons & Analysis
  lessons_learned?: string;
  what_worked?: string;
  what_didnt_work?: string;
  next_time_improvements?: string;
  
  // Calculated fields
  profit_loss: number;
  profit_loss_percentage: number;
  risk_reward_ratio?: number;
  is_winning_trade: boolean;
  max_risk_amount: number;
  actual_risk_reward?: number;
  
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

export interface PerformanceMetrics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_pnl: number;
  gross_profit: number;
  gross_loss: number;
  average_win: number;
  average_loss: number;
  largest_win: number;
  largest_loss: number;
  max_drawdown: number;
  max_drawdown_percent: number;
  profit_factor: number;
  expectancy: number;
  longest_winning_streak: number;
  longest_losing_streak: number;
  current_streak: number;
  current_streak_type: 'winning' | 'losing' | 'none';
  strategy_breakdown: Record<string, any>;
}

export interface RiskMetrics {
  total_risk: number;
  actual_risk: number;
  total_exposure: number;
  avg_risk_per_trade: number;
  risk_adjusted_return: number;
  volatility: number;
  risk_efficiency: number;
  exposure_ratio: number;
}

export interface EquityCurvePoint {
  date: string;
  trade_id: number;
  symbol: string;
  pnl: number;
  cumulative_pnl: number;
  peak: number;
  drawdown: number;
  drawdown_percent: number;
}

export interface StrategyStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  win_rate: number;
  average_win: number;
  average_loss: number;
  largest_win: number;
  largest_loss: number;
  profit_factor: number;
  total_volume: number;
  avg_holding_period: number;
}

export interface PaginatedTrades {
  trades: Trade[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}