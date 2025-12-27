import React from 'react';
import { Edit, Trash2, ArrowUpRight, CheckCircle, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { Trade } from '../types/Trade';
import { analyticsUtils } from '../utils/analytics';

interface TradeGridProps {
    trades: Trade[];
    onEdit: (trade: Trade) => void;
    onDelete: (tradeId: number) => void;
}

export const TradeGrid: React.FC<TradeGridProps> = ({ trades, onEdit, onDelete }) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trades.map((trade) => (
                <div key={trade.id} className="bg-white dark:bg-black text-gray-900 dark:text-white rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                    {/* Card Image / Header */}
                    <div className="bg-gray-100 dark:bg-gray-900 aspect-video relative overflow-hidden group">
                        {trade.screenshot_path ? (
                            <img
                                src={trade.screenshot_path} // Need to check if this is a full URL or relative path
                                alt={`${trade.symbol} chart`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/475569?text=No+Chart';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-900">
                                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                <span className="text-sm">No Screenshot</span>
                            </div>
                        )}

                        {/* Overlay P&L Badge */}
                        <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${trade.is_winning_trade
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                                }`}>
                                {trade.is_winning_trade ? 'WIN' : 'LOSS'}
                            </span>
                        </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{trade.symbol}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(trade.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-bold ${trade.is_winning_trade
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {analyticsUtils.formatCurrency(trade.profit_loss)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${trade.trade_type === 'long'
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                }`}>
                                {trade.trade_type.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                3 Account(s) {/* Static for now or derive if data available */}
                            </span>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                <span className="text-gray-500">Strategy:</span> {trade.strategy}
                            </p>
                            {trade.notes && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic line-clamp-2">
                                    "{trade.notes}"
                                </p>
                            )}
                        </div>

                        {/* Spacer to push actions to bottom */}
                        <div className="flex-1"></div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                            <button
                                onClick={() => onEdit(trade)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white text-sm rounded transition-colors border border-gray-200 dark:border-gray-700"
                            >
                                <div className="w-4 h-4" /> {/* Icon placeholder or icon */}
                                Review Now
                            </button>

                            <div className="flex items-center gap-1">
                                <button
                                    className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                    title="Share" // Placeholder action
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onEdit(trade)}
                                    className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(trade.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Reviewed Status (Mocked or derived) */}
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-500 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            <span>Reviewed</span>
                        </div>

                    </div>
                </div>
            ))}
        </div>
    );
};
