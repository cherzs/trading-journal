import React from 'react';
import { Edit, Trash2, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { Trade } from '../types/Trade';
import { calculatePnL } from '../utils/tradeStorage';

interface TradeListProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
}

export const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onDelete }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (trades.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No trades yet</h3>
        <p className="text-gray-500">Start building your trading journal by adding your first trade.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trades.map((trade) => {
        const pnl = calculatePnL(trade);
        const isProfitable = pnl > 0;
        const isLoss = pnl < 0;
        
        return (
          <div key={trade.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  trade.type === 'buy' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                  {trade.type === 'buy' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{trade.symbol}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="capitalize">{trade.type}</span>
                    <span>{trade.quantity} shares</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trade.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {trade.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(trade)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(trade.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Entry Price</div>
                <div className="font-semibold text-gray-900">{formatCurrency(trade.entryPrice)}</div>
              </div>
              
              {trade.exitPrice && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Exit Price</div>
                  <div className="font-semibold text-gray-900">{formatCurrency(trade.exitPrice)}</div>
                </div>
              )}
              
              <div>
                <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Entry Date
                </div>
                <div className="font-semibold text-gray-900">{formatDate(trade.entryDate)}</div>
              </div>
              
              {trade.exitDate && (
                <div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Exit Date
                  </div>
                  <div className="font-semibold text-gray-900">{formatDate(trade.exitDate)}</div>
                </div>
              )}
            </div>

            {trade.status === 'closed' && pnl !== 0 && (
              <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  isProfitable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  <DollarSign className="w-4 h-4" />
                  P&L: {formatCurrency(pnl)}
                </div>
              </div>
            )}

            {trade.strategy && (
              <div className="mb-3">
                <div className="text-sm text-gray-500 mb-1">Strategy</div>
                <div className="text-gray-900 font-medium">{trade.strategy}</div>
              </div>
            )}

            {trade.notes && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Notes</div>
                <div className="text-gray-700 text-sm leading-relaxed">{trade.notes}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};