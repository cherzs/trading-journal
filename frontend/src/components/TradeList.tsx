import React, { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Target, Shield, Brain } from 'lucide-react';
import { Trade } from '../types/Trade';
import { analyticsUtils } from '../utils/analytics';

interface TradeListProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: number) => void;
}

export const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onDelete }) => {
  const [expandedTrade, setExpandedTrade] = useState<number | null>(null);
  const [selectedTrades, setSelectedTrades] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExpanded = (tradeId: number) => {
    setExpandedTrade(expandedTrade === tradeId ? null : tradeId);
  };

  const toggleSelectAll = () => {
    if (selectedTrades.length === trades.length) {
      setSelectedTrades([]);
    } else {
      setSelectedTrades(trades.map(t => t.id));
    }
  };

  const toggleSelectTrade = (tradeId: number) => {
    if (selectedTrades.includes(tradeId)) {
      setSelectedTrades(selectedTrades.filter(id => id !== tradeId));
    } else {
      setSelectedTrades([...selectedTrades, tradeId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTrades.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedTrades.length} trades? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        // execute deletions sequentially to ensure stability
        for (const id of selectedTrades) {
          onDelete(id);
        }
        setSelectedTrades([]);
      } catch (error) {
        console.error('Failed to delete trades:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDelete = (tradeId: number) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      onDelete(tradeId);
    }
  };

  if (trades.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No trades found</h3>
        <p className="text-gray-500 dark:text-gray-400">Start by adding your first trade to begin tracking your performance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Header */}
      {trades.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedTrades.length === trades.length && trades.length > 0}
              onChange={toggleSelectAll}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedTrades.length > 0 ? `${selectedTrades.length} Selected` : 'Select All'}
            </span>
          </div>

          {selectedTrades.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : `Delete ${selectedTrades.length} Trades`}
            </button>
          )}
        </div>
      )}

      {trades.map((trade) => (
        <div key={trade.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Main Trade Row */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedTrades.includes(trade.id)}
                  onChange={() => toggleSelectTrade(trade.id)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${trade.is_winning_trade
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                  {trade.is_winning_trade ? (
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{trade.symbol}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${trade.trade_type === 'long'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                      }`}>
                      {trade.trade_type.toUpperCase()}
                    </span>
                    {trade.is_winning_trade && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                        WIN
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{trade.strategy}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-lg font-bold ${analyticsUtils.getPnLColor(trade.profit_loss)}`}>
                    {analyticsUtils.formatCurrency(trade.profit_loss)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {analyticsUtils.formatPercentage(trade.profit_loss_percentage)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpanded(trade.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {expandedTrade === trade.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(trade)}
                    className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(trade.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Entry:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-gray-200">{analyticsUtils.formatCurrency(trade.entry_price)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Exit:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-gray-200">{analyticsUtils.formatCurrency(trade.exit_price)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Size:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-gray-200">{trade.size}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Date:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-gray-200">{new Date(trade.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedTrade === trade.id && (
            <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Management */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Risk Management
                  </h4>
                  <div className="space-y-2 text-sm">
                    {trade.stop_loss && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Stop Loss:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{analyticsUtils.formatCurrency(trade.stop_loss)}</span>
                      </div>
                    )}
                    {trade.take_profit && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Take Profit:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{analyticsUtils.formatCurrency(trade.take_profit)}</span>
                      </div>
                    )}
                    {trade.risk_reward_ratio && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">R:R Ratio:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{trade.risk_reward_ratio.toFixed(2)}</span>
                      </div>
                    )}
                    {trade.position_size_percent && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Position Size:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{trade.position_size_percent}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Market Context */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Market Context
                  </h4>
                  <div className="space-y-2 text-sm">
                    {trade.market_condition && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Market:</span>
                        <span className={`font-medium ${analyticsUtils.getMarketConditionColor(trade.market_condition)}`}>
                          {trade.market_condition.charAt(0).toUpperCase() + trade.market_condition.slice(1)}
                        </span>
                      </div>
                    )}
                    {trade.sector && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Sector:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{trade.sector}</span>
                      </div>
                    )}
                    {trade.market_sentiment && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Sentiment:</span>
                        <span className={`font-medium ${analyticsUtils.getSentimentColor(trade.market_sentiment)}`}>
                          {trade.market_sentiment.charAt(0).toUpperCase() + trade.market_sentiment.slice(1)}
                        </span>
                      </div>
                    )}
                    {trade.timeframe && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Timeframe:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{trade.timeframe}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Psychological & Quality */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Quality & Psychology
                  </h4>
                  <div className="space-y-2 text-sm">
                    {trade.setup_quality && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Setup Quality:</span>
                        <span className={`font-medium ${analyticsUtils.getQualityColor(trade.setup_quality)}`}>
                          {trade.setup_quality}/10
                        </span>
                      </div>
                    )}
                    {trade.execution_quality && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Execution:</span>
                        <span className={`font-medium ${analyticsUtils.getQualityColor(trade.execution_quality)}`}>
                          {trade.execution_quality}/10
                        </span>
                      </div>
                    )}
                    {trade.confidence_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{trade.confidence_level}/10</span>
                      </div>
                    )}
                    {trade.holding_period && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Holding Period:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-200">{analyticsUtils.formatTimePeriod(trade.holding_period, 'hours')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Analysis & Notes */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Technical Analysis</h4>
                  <div className="space-y-2 text-sm">
                    {trade.entry_reason && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Entry Reason:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{trade.entry_reason}</p>
                      </div>
                    )}
                    {trade.exit_reason && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Exit Reason:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{trade.exit_reason}</p>
                      </div>
                    )}
                    {trade.technical_indicators && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Indicators:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{trade.technical_indicators}</p>
                      </div>
                    )}
                    {trade.chart_patterns && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Patterns:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{trade.chart_patterns}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Analysis & Notes</h4>
                  <div className="space-y-2 text-sm">
                    {trade.notes && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Notes:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{trade.notes}</p>
                      </div>
                    )}
                    {trade.lessons_learned && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Lessons:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{trade.lessons_learned}</p>
                      </div>
                    )}
                    {trade.what_worked && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">What Worked:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{trade.what_worked}</p>
                      </div>
                    )}
                    {trade.what_didnt_work && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">What Didn't Work:</span>
                        <p className="font-medium text-gray-900 dark:text-gray-200">{trade.what_didnt_work}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};