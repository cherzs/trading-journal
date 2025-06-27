import React, { useState, useEffect } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Trade } from '../types/Trade';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id'>) => void;
  onClose: () => void;
  editingTrade?: Trade;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, onClose, editingTrade }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'buy' as 'buy' | 'sell',
    quantity: '',
    entryPrice: '',
    exitPrice: '',
    entryDate: '',
    exitDate: '',
    status: 'open' as 'open' | 'closed',
    notes: '',
    strategy: ''
  });

  useEffect(() => {
    if (editingTrade) {
      setFormData({
        symbol: editingTrade.symbol,
        type: editingTrade.type,
        quantity: editingTrade.quantity.toString(),
        entryPrice: editingTrade.entryPrice.toString(),
        exitPrice: editingTrade.exitPrice?.toString() || '',
        entryDate: editingTrade.entryDate,
        exitDate: editingTrade.exitDate || '',
        status: editingTrade.status,
        notes: editingTrade.notes || '',
        strategy: editingTrade.strategy || ''
      });
    }
  }, [editingTrade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trade: Omit<Trade, 'id'> = {
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      quantity: parseFloat(formData.quantity),
      entryPrice: parseFloat(formData.entryPrice),
      exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : undefined,
      entryDate: formData.entryDate,
      exitDate: formData.exitDate || undefined,
      status: formData.status,
      notes: formData.notes || undefined,
      strategy: formData.strategy || undefined
    };

    onSubmit(trade);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {editingTrade ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            {editingTrade ? 'Edit Trade' : 'Add New Trade'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                placeholder="AAPL, TSLA, etc."
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'buy' | 'sell' }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="100"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entry Price</label>
              <input
                type="number"
                value={formData.entryPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: e.target.value }))}
                placeholder="150.00"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entry Date</label>
              <input
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'open' | 'closed' }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {formData.status === 'closed' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exit Price</label>
                  <input
                    type="number"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, exitPrice: e.target.value }))}
                    placeholder="160.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exit Date</label>
                  <input
                    type="date"
                    value={formData.exitDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, exitDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Strategy</label>
            <input
              type="text"
              value={formData.strategy}
              onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
              placeholder="Breakout, Support/Resistance, etc."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Trade notes, reasoning, market conditions, etc."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
            >
              {editingTrade ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingTrade ? 'Update Trade' : 'Add Trade'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};