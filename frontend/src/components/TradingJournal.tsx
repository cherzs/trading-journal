import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Calendar, Filter, Search, RefreshCw, LogIn, Target, Shield, Download, FileText, User, LogOut, Settings, TrendingUp, Database, LayoutGrid, List, Moon, Sun, Book } from 'lucide-react';
import { Trade } from '../types/Trade';
import { TradeForm } from './TradeForm';
import { TradeList } from './TradeList';
import { TradeGrid } from './TradeGrid';
import { AnalyticsDashboard } from './AnalyticsDashboard';

import { TradeTemplates } from './TradeTemplates';
import { AdvancedFilters } from './AdvancedFilters';
import { GoalsTracker } from './GoalsTracker';
import { RiskManagement } from './RiskManagement';
import { ExportReports } from './ExportReports';
import { Profile } from './Profile';
import { DocumentationModal } from './DocumentationModal';
import { tradeApi } from '../utils/api';
import { analyticsUtils } from '../utils/analytics';
import { logoutUser } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';

interface TradingJournalProps {
  currentUser?: any;
  onLogout?: () => void;
}

export const TradingJournal: React.FC<TradingJournalProps> = ({ currentUser: propUser, onLogout }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'long' | 'short'>('all');
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'loss'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeTab, setActiveTab] = useState<'trades' | 'analytics' | 'templates' | 'goals' | 'risk' | 'export'>('trades');
  const [strategies, setStrategies] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(propUser || null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showDocs, setShowDocs] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
      setIsAuthenticated(true);
      setLoading(false);
    } else {
      checkAuthStatus();
    }
  }, [propUser]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTrades();
      fetchPerformance();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Extract unique strategies and symbols from trades
    const uniqueStrategies = [...new Set(
      trades
        .filter(trade => trade && trade.strategy)
        .map(trade => trade.strategy)
    )];
    const uniqueSymbols = [...new Set(
      trades
        .filter(trade => trade && trade.symbol)
        .map(trade => trade.symbol)
    )];
    setStrategies(uniqueStrategies);
    setSymbols(uniqueSymbols);
  }, [trades]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://trading-journal-0mup.onrender.com/api'}/auth/status`, {
        credentials: 'include',
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
      } else {
        setAuthError('Please log in to access the trading journal');
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setAuthError('Unable to connect to server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await tradeApi.getTrades();
      const tradesData = response.trades || [];

      // Filter out invalid trades
      const validTrades = tradesData.filter(trade => {
        if (!trade) {
          console.warn('Found null/undefined trade');
          return false;
        }
        if (!trade.symbol || !trade.strategy) {
          console.warn('Trade missing required fields:', trade);
          return false;
        }
        return true;
      });

      setTrades(validTrades);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      setAuthError('Failed to fetch trades. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://trading-journal-0mup.onrender.com/api'}/analytics/performance`, {
        credentials: 'include',
      });
      const data = await response.json();
      setPerformance(data.performance);
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  };

  const handleAddTrade = async (trade: Omit<Trade, 'id'>) => {
    try {
      const newTrade = await tradeApi.createTrade(trade);
      setTrades(prev => [newTrade, ...prev]);
      setShowForm(false);
      fetchPerformance(); // Refresh performance data
    } catch (error) {
      console.error('Failed to add trade:', error);
    }
  };

  const handleUpdateTrade = async (trade: Omit<Trade, 'id'>) => {
    if (!editingTrade) return;

    try {
      const updatedTrade = await tradeApi.updateTrade(editingTrade.id, trade);
      setTrades(prev => prev.map(t => t.id === editingTrade.id ? updatedTrade : t));
      setShowForm(false);
      setEditingTrade(undefined);
      fetchPerformance(); // Refresh performance data
    } catch (error) {
      console.error('Failed to update trade:', error);
    }
  };

  const handleDeleteTrade = async (tradeId: number) => {
    try {
      await tradeApi.deleteTrade(tradeId);
      setTrades(prev => prev.filter(t => t.id !== tradeId));
      fetchPerformance(); // Refresh performance data
    } catch (error) {
      console.error('Failed to delete trade:', error);
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setShowForm(true);
  };

  const handleTemplateSelect = (template: any) => {
    setEditingTrade({
      ...editingTrade,
      strategy: template.strategy,
      trade_type: template.trade_type,
      size: template.default_size,
      stop_loss: template.default_stop_loss_percent,
      take_profit: template.default_take_profit_percent,
      timeframe: template.timeframe,
      notes: template.notes
    } as Trade);
    setShowForm(true);
  };

  const handleAdvancedFilters = (conditions: any[]) => {
    // Apply advanced filters to trades
    console.log('Applying advanced filters:', conditions);
    // This would filter trades based on the conditions
  };

  const filteredTrades = trades.filter(trade => {
    // Ensure trade and its properties exist before accessing them
    if (!trade || !trade.symbol || !trade.strategy) {
      return false;
    }

    // Ensure searchTerm is a string
    const searchLower = (searchTerm || '').toLowerCase();

    const matchesSearch = trade.symbol.toLowerCase().includes(searchLower) ||
      trade.strategy.toLowerCase().includes(searchLower) ||
      (trade.notes && trade.notes.toLowerCase().includes(searchLower));

    const matchesStrategy = !filterStrategy || trade.strategy === filterStrategy;
    const matchesType = filterType === 'all' || trade.trade_type === filterType;
    const matchesResult = filterResult === 'all' ||
      (filterResult === 'win' && trade.is_winning_trade) ||
      (filterResult === 'loss' && !trade.is_winning_trade);

    const matchesDateRange = (!dateRange.start || trade.date >= dateRange.start) &&
      (!dateRange.end || trade.date <= dateRange.end);

    return matchesSearch && matchesStrategy && matchesType && matchesResult && matchesDateRange;
  });

  const totalPnL = trades.filter(trade => trade && typeof trade.profit_loss === 'number').reduce((sum, trade) => sum + trade.profit_loss, 0);
  const winningTrades = trades.filter(trade => trade && trade.is_winning_trade);

  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
      } else {
        await logoutUser();
        setIsAuthenticated(false);
        setCurrentUser(null);
        setAuthError('Please log in to access the trading journal');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileClose = () => {
    setShowProfile(false);
  };

  const handleAddDemoData = async () => {
    try {
      setLoading(true);
      await tradeApi.importDemoData();
      await fetchTrades();
      await fetchPerformance();
      // Optional: Show a toast notification instead of alert
      // alert('Demo data added successfully!');
    } catch (error) {
      console.error('Failed to add demo data:', error);
      // alert('Failed to add demo data');
    } finally {
      setLoading(false);
      setShowUserMenu(false);
    }
  };

  // Show authentication error or loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{authError || 'Please log in to access the trading journal'}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={checkAuthStatus}
              className="w-full text-gray-600 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-none">Trading Journal</h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hidden md:block">Track your trades and analyze your performance</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Documentation Button */}
              <button
                onClick={() => setShowDocs(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                title="Documentation"
              >
                <Book className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser?.username || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser?.email || 'user@example.com'}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                    <button
                      onClick={() => {
                        setShowProfile(true);
                        setShowUserMenu(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={handleAddDemoData}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      <span>Add Demo Data</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</p>
                <p className={`text-2xl font-bold ${analyticsUtils.getPnLColor(totalPnL)}`}>
                  {analyticsUtils.formatCurrency(totalPnL)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{trades.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
                <p className={`text-2xl font-bold ${analyticsUtils.getWinRateColor(winRate)}`}>
                  {analyticsUtils.formatPercentage(winRate)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Trade</p>
                <p className={`text-2xl font-bold ${analyticsUtils.getPnLColor(trades.length > 0 ? totalPnL / trades.length : 0)}`}>
                  {analyticsUtils.formatCurrency(trades.length > 0 ? totalPnL / trades.length : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 sticky top-16 z-40 bg-gray-50 dark:bg-slate-900 pt-4 -mt-4">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-6 md:space-x-8 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => setActiveTab('trades')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'trades'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="whitespace-nowrap">Trades</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="whitespace-nowrap">Analytics</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="whitespace-nowrap">Templates</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'goals'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="whitespace-nowrap">Goals</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('risk')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'risk'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="whitespace-nowrap">Risk Management</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'export'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span className="whitespace-nowrap">Export & Reports</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'trades' && (
          <>
            {/* Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search trades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={filterStrategy}
                      onChange={(e) => setFilterStrategy(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="">All Strategies</option>
                      {strategies.map(strategy => (
                        <option key={strategy} value={strategy}>{strategy}</option>
                      ))}
                    </select>

                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as 'all' | 'long' | 'short')}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="all">All Types</option>
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>

                    <select
                      value={filterResult}
                      onChange={(e) => setFilterResult(e.target.value as 'all' | 'win' | 'loss')}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                      <option value="all">All Results</option>
                      <option value="win">Winning</option>
                      <option value="loss">Losing</option>
                    </select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <AdvancedFilters
                  onApplyFilters={handleAdvancedFilters}
                  onClearFilters={() => { }}
                  strategies={strategies}
                  symbols={symbols}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredTrades.length} of {trades.length} trades
                </div>
                <div className="flex gap-2">
                  <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 mr-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                        ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={fetchTrades}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Trade
                  </button>
                </div>
              </div>
            </div>

            {/* Trade List / Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : viewMode === 'grid' ? (
              <TradeGrid
                trades={filteredTrades}
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
              />
            ) : (
              <TradeList
                trades={filteredTrades}
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
              />
            )}
          </>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            startDate={dateRange.start || undefined}
            endDate={dateRange.end || undefined}
          />
        )}

        {activeTab === 'templates' && (
          <TradeTemplates
            onSelectTemplate={handleTemplateSelect}
            onSaveTemplate={() => { }}
            onDeleteTemplate={() => { }}
            currentTrade={editingTrade}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsTracker
            currentPerformance={{
              total_pnl: totalPnL,
              win_rate: winRate,
              total_trades: trades.length,
              max_drawdown_percent: performance?.max_drawdown_percent || 0
            }}
          />
        )}

        {activeTab === 'risk' && (
          <RiskManagement
            trades={trades}
            accountSize={10000} // This could be user configurable
          />
        )}

        {activeTab === 'export' && (
          <ExportReports
            trades={trades}
            performance={performance}
          />
        )}

        {/* Trade Form Modal */}
        {showForm && (
          <TradeForm
            onSubmit={editingTrade ? handleUpdateTrade : handleAddTrade}
            onClose={() => {
              setShowForm(false);
              setEditingTrade(undefined);
            }}
            editingTrade={editingTrade}
          />
        )}

        {/* Profile Modal */}
        {showProfile && currentUser && (
          <Profile
            user={currentUser}
            onLogout={handleLogout}
            onClose={handleProfileClose}
          />
        )}

        {/* Documentation Modal */}
        {showDocs && (
          <DocumentationModal
            onClose={() => setShowDocs(false)}
          />
        )}
      </div>
    </div>
  );
};