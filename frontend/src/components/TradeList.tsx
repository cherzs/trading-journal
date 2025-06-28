import React, { useState } from 'react';
import { Edit, Trash2, Eye, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Target, Shield, Brain, Clock } from 'lucide-react';
import { Trade } from '../types/Trade';
import { analyticsUtils } from '../utils/analytics';

interface TradeListProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: number) => void;
}

export const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onDelete }) => {
  const [expandedTrade, setExpandedTrade] = useState<number | null>(null);

  const toggleExpanded = (tradeId: number) => {
    setExpandedTrade(expandedTrade === tradeId ? null : tradeId);
  };

  const handleDelete = (tradeId: number) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      onDelete(tradeId);
    }
  };

  if (trades.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No trades found</h3>
        <p className="text-gray-500">Start by adding your first trade to begin tracking your performance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trades.map((trade) => (
        <div key={trade.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Main Trade Row */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  trade.is_winning_trade ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {trade.is_winning_trade ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{trade.symbol}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      trade.trade_type === 'long' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {trade.trade_type.toUpperCase()}
                    </span>
                    {trade.is_winning_trade && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        WIN
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{trade.strategy}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-lg font-bold ${analyticsUtils.getPnLColor(trade.profit_loss)}`}>
                    {analyticsUtils.formatCurrency(trade.profit_loss)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {analyticsUtils.formatPercentage(trade.profit_loss_percentage)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpanded(trade.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedTrade === trade.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(trade)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(trade.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Entry:</span>
                <span className="ml-1 font-medium">{analyticsUtils.formatCurrency(trade.entry_price)}</span>
              </div>
              <div>
                <span className="text-gray-500">Exit:</span>
                <span className="ml-1 font-medium">{analyticsUtils.formatCurrency(trade.exit_price)}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-1 font-medium">{trade.size}</span>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <span className="ml-1 font-medium">{new Date(trade.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedTrade === trade.id && (
            <div className="border-t border-gray-100 bg-gray-50 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Management */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Risk Management
                  </h4>
                  <div className="space-y-2 text-sm">
                    {trade.stop_loss && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stop Loss:</span>
                        <span className="font-medium">{analyticsUtils.formatCurrency(trade.stop_loss)}</span>
                      </div>
                    )}
                    {trade.take_profit && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Take Profit:</span>
                        <span className="font-medium">{analyticsUtils.formatCurrency(trade.take_profit)}</span>
                      </div>
                    )}
                    {trade.risk_reward_ratio && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">R:R Ratio:</span>
                        <span className="font-medium">{trade.risk_reward_ratio.toFixed(2)}</span>
                      </div>
                    )}
                    {trade.position_size_percent && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position Size:</span>
                        <span className="font-medium">{trade.position_size_percent}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Market Context */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Market Context
                  </h4>
                  <div className="space-y-2 text-sm">
                    {trade.market_condition && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Market:</span>
                        <span className={`font-medium ${analyticsUtils.getMarketConditionColor(trade.market_condition)}`}>
                          {trade.market_condition.charAt(0).toUpperCase() + trade.market_condition.slice(1)}
                        </span>
                      </div>
                    )}
                    {trade.sector && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sector:</span>
                        <span className="font-medium">{trade.sector}</span>
                      </div>
                    )}
                    {trade.market_sentiment && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sentiment:</span>
                        <span className={`font-medium ${analyticsUtils.getSentimentColor(trade.market_sentiment)}`}>
                          {trade.market_sentiment.charAt(0).toUpperCase() + trade.market_sentiment.slice(1)}
                        </span>
                      </div>
                    )}
                    {trade.timeframe && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timeframe:</span>
                        <span className="font-medium">{trade.timeframe}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Psychological & Quality */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Quality & Psychology
                  </h4>
                  <div className="space-y-2 text-sm">
                    {trade.setup_quality && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Setup Quality:</span>
                        <span className={`font-medium ${analyticsUtils.getQualityColor(trade.setup_quality)}`}>
                          {trade.setup_quality}/10
                        </span>
                      </div>
                    )}
                    {trade.execution_quality && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Execution:</span>
                        <span className={`font-medium ${analyticsUtils.getQualityColor(trade.execution_quality)}`}>
                          {trade.execution_quality}/10
                        </span>
                      </div>
                    )}
                    {trade.confidence_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium">{trade.confidence_level}/10</span>
                      </div>
                    )}
                    {trade.holding_period && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Holding Period:</span>
                        <span className="font-medium">{analyticsUtils.formatTimePeriod(trade.holding_period, 'hours')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Analysis & Notes */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Technical Analysis</h4>
                  <div className="space-y-2 text-sm">
                    {trade.entry_reason && (
                      <div>
                        <span className="text-gray-600">Entry Reason:</span>
                        <p className="font-medium">{trade.entry_reason}</p>
                      </div>
                    )}
                    {trade.exit_reason && (
                      <div>
                        <span className="text-gray-600">Exit Reason:</span>
                        <p className="font-medium">{trade.exit_reason}</p>
                      </div>
                    )}
                    {trade.technical_indicators && (
                      <div>
                        <span className="text-gray-600">Indicators:</span>
                        <p className="font-medium">{trade.technical_indicators}</p>
                      </div>
                    )}
                    {trade.chart_patterns && (
                      <div>
                        <span className="text-gray-600">Patterns:</span>
                        <p className="font-medium">{trade.chart_patterns}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Analysis & Notes</h4>
                  <div className="space-y-2 text-sm">
                    {trade.notes && (
                      <div>
                        <span className="text-gray-600">Notes:</span>
                        <p className="font-medium">{trade.notes}</p>
                      </div>
                    )}
                    {trade.lessons_learned && (
                      <div>
                        <span className="text-gray-600">Lessons:</span>
                        <p className="font-medium">{trade.lessons_learned}</p>
                      </div>
                    )}
                    {trade.what_worked && (
                      <div>
                        <span className="text-gray-600">What Worked:</span>
                        <p className="font-medium">{trade.what_worked}</p>
                      </div>
                    )}
                    {trade.what_didnt_work && (
                      <div>
                        <span className="text-gray-600">What Didn't Work:</span>
                        <p className="font-medium">{trade.what_didnt_work}</p>
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