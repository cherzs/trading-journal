import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, LogOut, TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';
import { Trade, User } from '../types/Trade';
import { TradeForm } from './TradeForm';
import { TradeList } from './TradeList';
import { saveTrades, loadTrades, calculatePnL } from '../utils/tradeStorage';
import { logoutUser } from '../utils/auth';

interface TradingJournalProps {
  user: User;
  onLogout: () => void;
}

export const TradingJournal: React.FC<TradingJournalProps> = ({ user, onLogout }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    const userTrades = loadTrades(user.id);
    setTrades(userTrades);
  }, [user.id]);

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.strategy?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trades, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalTrades = trades.length;
    const openTrades = trades.filter(t => t.status === 'open').length;
    const closedTrades = trades.filter(t => t.status === 'closed').length;
    const totalPnL = trades.reduce((sum, trade) => sum + calculatePnL(trade), 0);
    const winningTrades = trades.filter(t => calculatePnL(t) > 0).length;
    const winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0;

    return { totalTrades, openTrades, closedTrades, totalPnL, winRate };
  }, [trades]);

  const handleAddTrade = (tradeData: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...tradeData,
      id: Date.now().toString(),
      pnl: calculatePnL({ ...tradeData, id: '' })
    };
    
    const updatedTrades = [...trades, newTrade];
    setTrades(updatedTrades);
    saveTrades(user.id, updatedTrades);
    setShowForm(false);
  };

  const handleEditTrade = (tradeData: Omit<Trade, 'id'>) => {
    if (!editingTrade) return;
    
    const updatedTrade: Trade = {
      ...tradeData,
      id: editingTrade.id,
      pnl: calculatePnL({ ...tradeData, id: editingTrade.id })
    };
    
    const updatedTrades = trades.map(t => t.id === editingTrade.id ? updatedTrade : t);
    setTrades(updatedTrades);
    saveTrades(user.id, updatedTrades);
    setEditingTrade(undefined);
    setShowForm(false);
  };

  const handleDeleteTrade = (tradeId: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      const updatedTrades = trades.filter(t => t.id !== tradeId);
      setTrades(updatedTrades);
      saveTrades(user.id, updatedTrades);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TradeJournal</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrades}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Open Positions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openTrades}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total P&L</p>
                <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.totalPnL)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.winRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search trades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-64"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'closed')}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value="all">All Trades</option>
                  <option value="open">Open Only</option>
                  <option value="closed">Closed Only</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Trade
            </button>
          </div>
        </div>

        {/* Trade List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <TradeList
            trades={filteredTrades}
            onEdit={(trade) => {
              setEditingTrade(trade);
              setShowForm(true);
            }}
            onDelete={handleDeleteTrade}
          />
        </div>
      </div>

      {/* Trade Form Modal */}
      {showForm && (
        <TradeForm
          onSubmit={editingTrade ? handleEditTrade : handleAddTrade}
          onClose={() => {
            setShowForm(false);
            setEditingTrade(undefined);
          }}
          editingTrade={editingTrade}
        />
      )}
    </div>
  );
};