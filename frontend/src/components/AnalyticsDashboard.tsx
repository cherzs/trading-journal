
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Award
} from 'lucide-react';
import { analyticsApi, analyticsUtils } from '../utils/analytics';
import { PerformanceMetrics, RiskMetrics, StrategyStats, EquityCurvePoint } from '../types/Trade';
import { EquityChart } from './charts/EquityChart';
import { StrategyChart } from './charts/StrategyChart';
import { MonthlyChart } from './charts/MonthlyChart';

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
  const [equityCurve, setEquityCurve] = useState<EquityCurvePoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [performanceData, riskData, strategyData, equityData] = await Promise.all([
          analyticsApi.getPerformance(startDate, endDate),
          analyticsApi.getRiskMetrics(startDate, endDate),
          analyticsApi.getStrategyPerformance(startDate, endDate),
          analyticsApi.getEquityCurve(startDate, endDate)
        ]);

        // Fetch monthly data separately as it might depend on year selector, defaulting to current year for now
        const monthlyStats = await analyticsApi.getMonthlyPerformance(new Date().getFullYear());

        setPerformance(performanceData);
        setRiskMetrics(riskData);
        setStrategyStats(strategyData);
        setEquityCurve(equityData);
        setMonthlyData(monthlyStats.monthly_data);

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
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</p>
              <p className={`text-2xl font-bold ${analyticsUtils.getPnLColor(performance.total_pnl)}`}>
                {analyticsUtils.formatCurrency(performance.total_pnl)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${analyticsUtils.getPnLBackgroundColor(performance.total_pnl)}`}>
              {performance.total_pnl >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
              <p className={`text-2xl font-bold ${analyticsUtils.getWinRateColor(performance.win_rate)}`}>
                {analyticsUtils.formatPercentage(performance.win_rate)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{performance.total_trades}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/30">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Factor</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof performance.profit_factor === 'number' && isFinite(performance.profit_factor)
                  ? performance.profit_factor.toFixed(2)
                  : performance.profit_factor === Infinity ? '∞' : '-'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Curve */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Equity Curve
          </h3>
          {equityCurve.length > 0 ? (
            <EquityChart data={equityCurve} />
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No trade data to display chart
            </div>
          )}
        </div>

        {/* Monthly Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Monthly Performance
          </h3>
          {monthlyData ? (
            <MonthlyChart data={monthlyData} />
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No monthly data available
            </div>
          )}
        </div>

        {/* Strategy Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Strategy Distribution (Volume)
          </h3>
          {strategyStats && Object.keys(strategyStats).length > 0 ? (
            <StrategyChart data={strategyStats} />
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400 dark:text-gray-500">
              No strategy data available
            </div>
          )}
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Statistics */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Trade Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Winning Trades</span>
              <span className="font-medium text-green-600 dark:text-green-400">{performance.winning_trades}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Losing Trades</span>
              <span className="font-medium text-red-600 dark:text-red-400">{performance.losing_trades}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Win</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {analyticsUtils.formatCurrency(performance.average_win)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Loss</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {analyticsUtils.formatCurrency(performance.average_loss)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Largest Win</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {analyticsUtils.formatCurrency(performance.largest_win)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Largest Loss</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {analyticsUtils.formatCurrency(performance.largest_loss)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Analysis
          </h3>
          {riskMetrics && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Max Drawdown</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {analyticsUtils.formatCurrency(performance.max_drawdown)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Drawdown %</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {analyticsUtils.formatPercentage(performance.max_drawdown_percent)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Expectancy</span>
                <span className={`font-medium ${analyticsUtils.getPnLColor(performance.expectancy)}`}>
                  {analyticsUtils.formatCurrency(performance.expectancy)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Volatility</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analyticsUtils.formatCurrency(riskMetrics.volatility)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Risk Efficiency</span>
                <span className={`font-medium ${analyticsUtils.getPnLColor(riskMetrics.risk_efficiency)}`}>
                  {typeof riskMetrics.risk_efficiency === 'number' && isFinite(riskMetrics.risk_efficiency)
                    ? riskMetrics.risk_efficiency.toFixed(2)
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Avg Risk Per Trade</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {analyticsUtils.formatCurrency(riskMetrics.avg_risk_per_trade)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Streak Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Streak Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{performance.longest_winning_streak}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Longest Winning Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{performance.longest_losing_streak}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Longest Losing Streak</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${performance.current_streak_type === 'winning' ? 'text-green-600 dark:text-green-400' :
              performance.current_streak_type === 'losing' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
              {performance.current_streak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak ({performance.current_streak_type})</div>
          </div>
        </div>
      </div>

      {/* Strategy Performance Details Table */}
      {strategyStats && Object.keys(strategyStats).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Strategy Performance Details
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Strategy</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Trades</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Win Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">P&L</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Avg Win</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Avg Loss</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Profit Factor</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(strategyStats).map(([strategy, stats]) => (
                  <tr key={strategy} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{strategy}</td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">{stats.total_trades}</td>
                    <td className={`py-3 px-4 text-right font-medium ${analyticsUtils.getWinRateColor(stats.win_rate)}`}>
                      {analyticsUtils.formatPercentage(stats.win_rate)}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${analyticsUtils.getPnLColor(stats.total_pnl)}`}>
                      {analyticsUtils.formatCurrency(stats.total_pnl)}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
                      {analyticsUtils.formatCurrency(stats.average_win)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">
                      {analyticsUtils.formatCurrency(stats.average_loss)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
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
