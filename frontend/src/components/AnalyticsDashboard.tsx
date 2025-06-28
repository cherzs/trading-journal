import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  BarChart3, 
  Calendar,
  DollarSign,
  Percent,
  Activity,
  Zap,
  Shield,
  Award
} from 'lucide-react';
import { analyticsApi, analyticsUtils } from '../utils/analytics';
import { PerformanceMetrics, RiskMetrics, StrategyStats } from '../types/Trade';

interface AnalyticsDashboardProps {
  startDate?: string;
  endDate?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  startDate, 
  endDate 
}) => {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [strategyStats, setStrategyStats] = useState<Record<string, StrategyStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [performanceData, riskData, strategyData] = await Promise.all([
          analyticsApi.getPerformance(startDate, endDate),
          analyticsApi.getRiskMetrics(startDate, endDate),
          analyticsApi.getStrategyPerformance(startDate, endDate)
        ]);

        setPerformance(performanceData);
        setRiskMetrics(riskData);
        setStrategyStats(strategyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Error loading analytics</span>
        </div>
        <p className="text-red-500 mt-2">{error}</p>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">Start trading to see your analytics dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total P&L</p>
              <p className={`text-2xl font-bold ${analyticsUtils.getPnLColor(performance.total_pnl)}`}>
                {analyticsUtils.formatCurrency(performance.total_pnl)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${analyticsUtils.getPnLBackgroundColor(performance.total_pnl)}`}>
              {performance.total_pnl >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className={`text-2xl font-bold ${analyticsUtils.getWinRateColor(performance.win_rate)}`}>
                {analyticsUtils.formatPercentage(performance.win_rate)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900">{performance.total_trades}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Factor</p>
              <p className="text-2xl font-bold text-gray-900">
                {typeof performance.profit_factor === 'number' && isFinite(performance.profit_factor)
                  ? performance.profit_factor.toFixed(2)
                  : performance.profit_factor === Infinity ? '∞' : '-'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Trade Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Winning Trades</span>
              <span className="font-medium text-green-600">{performance.winning_trades}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Losing Trades</span>
              <span className="font-medium text-red-600">{performance.losing_trades}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Win</span>
              <span className="font-medium text-green-600">
                {analyticsUtils.formatCurrency(performance.average_win)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Loss</span>
              <span className="font-medium text-red-600">
                {analyticsUtils.formatCurrency(performance.average_loss)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Largest Win</span>
              <span className="font-medium text-green-600">
                {analyticsUtils.formatCurrency(performance.largest_win)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Largest Loss</span>
              <span className="font-medium text-red-600">
                {analyticsUtils.formatCurrency(performance.largest_loss)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Analysis
          </h3>
          {riskMetrics && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Max Drawdown</span>
                <span className="font-medium text-red-600">
                  {analyticsUtils.formatCurrency(performance.max_drawdown)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Drawdown %</span>
                <span className="font-medium text-red-600">
                  {analyticsUtils.formatPercentage(performance.max_drawdown_percent)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expectancy</span>
                <span className={`font-medium ${analyticsUtils.getPnLColor(performance.expectancy)}`}>
                  {analyticsUtils.formatCurrency(performance.expectancy)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Volatility</span>
                <span className="font-medium text-gray-900">
                  {analyticsUtils.formatCurrency(riskMetrics.volatility)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Risk Efficiency</span>
                <span className={`font-medium ${analyticsUtils.getPnLColor(riskMetrics.risk_efficiency)}`}>
                  {typeof riskMetrics.risk_efficiency === 'number' && isFinite(riskMetrics.risk_efficiency)
                    ? riskMetrics.risk_efficiency.toFixed(2)
                    : '-'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Streak Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Streak Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{performance.longest_winning_streak}</div>
            <div className="text-sm text-gray-600">Longest Winning Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{performance.longest_losing_streak}</div>
            <div className="text-sm text-gray-600">Longest Losing Streak</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              performance.current_streak_type === 'winning' ? 'text-green-600' : 
              performance.current_streak_type === 'losing' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {performance.current_streak}
            </div>
            <div className="text-sm text-gray-600">Current Streak ({performance.current_streak_type})</div>
          </div>
        </div>
      </div>

      {/* Strategy Performance */}
      {strategyStats && Object.keys(strategyStats).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Strategy Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Strategy</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Trades</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Win Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">P&L</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Avg Win</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Avg Loss</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Profit Factor</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(strategyStats).map(([strategy, stats]) => (
                  <tr key={strategy} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{strategy}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{stats.total_trades}</td>
                    <td className={`py-3 px-4 text-right font-medium ${analyticsUtils.getWinRateColor(stats.win_rate)}`}>
                      {analyticsUtils.formatPercentage(stats.win_rate)}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${analyticsUtils.getPnLColor(stats.total_pnl)}`}>
                      {analyticsUtils.formatCurrency(stats.total_pnl)}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {analyticsUtils.formatCurrency(stats.average_win)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      {analyticsUtils.formatCurrency(stats.average_loss)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {typeof stats.profit_factor === 'number' && isFinite(stats.profit_factor)
                        ? stats.profit_factor.toFixed(2)
                        : stats.profit_factor === Infinity ? '∞' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 