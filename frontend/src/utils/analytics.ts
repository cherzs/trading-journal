import { PerformanceMetrics, RiskMetrics, EquityCurvePoint, StrategyStats } from '../types/Trade';

// Use environment variable for API URL, fallback to deployed URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://trading-journal-0mup.onrender.com/api';

export const analyticsApi = {
  // Get overall performance metrics
  async getPerformance(startDate?: string, endDate?: string): Promise<PerformanceMetrics> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await fetch(`${API_BASE_URL}/analytics/performance?${params}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch performance data');
    }
    
    const data = await response.json();
    return data.performance;
  },

  // Get monthly performance breakdown
  async getMonthlyPerformance(year?: number): Promise<Record<string, any>> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    
    const response = await fetch(`${API_BASE_URL}/analytics/performance/monthly?${params}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch monthly performance data');
    }
    
    const data = await response.json();
    return data;
  },

  // Get strategy performance breakdown
  async getStrategyPerformance(startDate?: string, endDate?: string): Promise<Record<string, StrategyStats>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await fetch(`${API_BASE_URL}/analytics/performance/strategy?${params}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch strategy performance data');
    }
    
    const data = await response.json();
    return data.strategy_stats;
  },

  // Get equity curve data
  async getEquityCurve(startDate?: string, endDate?: string): Promise<EquityCurvePoint[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await fetch(`${API_BASE_URL}/analytics/performance/equity-curve?${params}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch equity curve data');
    }
    
    const data = await response.json();
    return data.equity_curve;
  },

  // Get risk metrics
  async getRiskMetrics(startDate?: string, endDate?: string): Promise<RiskMetrics> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await fetch(`${API_BASE_URL}/analytics/performance/risk-metrics?${params}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch risk metrics');
    }
    
    const data = await response.json();
    return data.risk_metrics;
  }
};

// Utility functions for analytics
export const analyticsUtils = {
  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  // Format percentage
  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  },

  // Get color based on P&L
  getPnLColor(pnl: number): string {
    if (pnl > 0) return 'text-green-600';
    if (pnl < 0) return 'text-red-600';
    return 'text-gray-600';
  },

  // Get background color based on P&L
  getPnLBackgroundColor(pnl: number): string {
    if (pnl > 0) return 'bg-green-50';
    if (pnl < 0) return 'bg-red-50';
    return 'bg-gray-50';
  },

  // Get win rate color
  getWinRateColor(winRate: number): string {
    if (winRate >= 60) return 'text-green-600';
    if (winRate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  },

  // Calculate compound annual growth rate
  calculateCAGR(initialValue: number, finalValue: number, years: number): number {
    if (initialValue <= 0 || years <= 0) return 0;
    return Math.pow(finalValue / initialValue, 1 / years) - 1;
  },

  // Calculate Sharpe ratio (simplified)
  calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (returns.length === 0) return 0;
    
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    
    return (meanReturn - riskFreeRate) / stdDev;
  },

  // Get market condition color
  getMarketConditionColor(condition: string): string {
    switch (condition?.toLowerCase()) {
      case 'bull': return 'text-green-600';
      case 'bear': return 'text-red-600';
      case 'sideways': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  },

  // Get sentiment color
  getSentimentColor(sentiment: string): string {
    switch (sentiment?.toLowerCase()) {
      case 'bullish': return 'text-green-600';
      case 'bearish': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  },

  // Format time period
  formatTimePeriod(period: number, unit: 'hours' | 'days'): string {
    if (unit === 'hours') {
      if (period < 24) return `${period}h`;
      const days = Math.floor(period / 24);
      const hours = period % 24;
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    } else {
      return `${period}d`;
    }
  },

  // Get quality rating color
  getQualityColor(rating: number): string {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    if (rating >= 4) return 'text-orange-600';
    return 'text-red-600';
  }
}; 