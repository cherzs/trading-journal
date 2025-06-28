import React, { useState, useEffect } from 'react';
import { Shield, Calculator, AlertTriangle, TrendingDown, DollarSign, Percent } from 'lucide-react';

interface PositionSizing {
  account_size: number;
  risk_per_trade: number;
  entry_price: number;
  stop_loss: number;
  position_size: number;
  shares: number;
  risk_amount: number;
  risk_percent: number;
}

interface PortfolioRisk {
  total_exposure: number;
  max_risk_per_trade: number;
  recommended_position_size: number;
  portfolio_heat_map: Array<{
    symbol: string;
    exposure: number;
    risk: number;
    percentage: number;
  }>;
}

interface RiskManagementProps {
  trades: any[];
  accountSize?: number;
}

export const RiskManagement: React.FC<RiskManagementProps> = ({ trades, accountSize = 10000 }) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'portfolio'>('calculator');
  const [positionSizing, setPositionSizing] = useState<PositionSizing>({
    account_size: accountSize,
    risk_per_trade: 1, // 1% default
    entry_price: 0,
    stop_loss: 0,
    position_size: 0,
    shares: 0,
    risk_amount: 0,
    risk_percent: 0
  });

  const [portfolioRisk, setPortfolioRisk] = useState<PortfolioRisk>({
    total_exposure: 0,
    max_risk_per_trade: 0,
    recommended_position_size: 0,
    portfolio_heat_map: []
  });

  useEffect(() => {
    calculatePositionSize();
  }, [positionSizing.account_size, positionSizing.risk_per_trade, positionSizing.entry_price, positionSizing.stop_loss]);

  useEffect(() => {
    calculatePortfolioRisk();
  }, [trades, accountSize]);

  const calculatePositionSize = () => {
    const { account_size, risk_per_trade, entry_price, stop_loss } = positionSizing;
    
    if (entry_price > 0 && stop_loss > 0 && account_size > 0) {
      const risk_percent = risk_per_trade / 100;
      const risk_amount = account_size * risk_percent;
      const price_risk = Math.abs(entry_price - stop_loss);
      const shares = risk_amount / price_risk;
      const position_size = shares * entry_price;
      const actual_risk_percent = (risk_amount / account_size) * 100;

      setPositionSizing(prev => ({
        ...prev,
        position_size,
        shares: Math.floor(shares),
        risk_amount,
        risk_percent: actual_risk_percent
      }));
    }
  };

  const calculatePortfolioRisk = () => {
    if (!trades.length) return;

    // Calculate total exposure
    const total_exposure = trades.reduce((sum, trade) => {
      return sum + (trade.entry_price * trade.size);
    }, 0);

    // Calculate max risk per trade (2% of account)
    const max_risk_per_trade = accountSize * 0.02;

    // Calculate recommended position size based on Kelly Criterion
    const winning_trades = trades.filter(t => t.is_winning_trade);
    const losing_trades = trades.filter(t => !t.is_winning_trade);
    
    const win_rate = winning_trades.length / trades.length;
    const avg_win = winning_trades.length > 0 
      ? winning_trades.reduce((sum, t) => sum + t.profit_loss, 0) / winning_trades.length 
      : 0;
    const avg_loss = losing_trades.length > 0 
      ? Math.abs(losing_trades.reduce((sum, t) => sum + t.profit_loss, 0) / losing_trades.length)
      : 0;

    const kelly_percentage = avg_loss > 0 ? (win_rate * avg_win - (1 - win_rate) * avg_loss) / avg_win : 0;
    const recommended_position_size = Math.max(0, Math.min(kelly_percentage * 100, 5)); // Cap at 5%

    // Create portfolio heat map
    const symbolExposure: { [key: string]: { exposure: number; risk: number } } = {};
    
    trades.forEach(trade => {
      if (!symbolExposure[trade.symbol]) {
        symbolExposure[trade.symbol] = { exposure: 0, risk: 0 };
      }
      symbolExposure[trade.symbol].exposure += trade.entry_price * trade.size;
      symbolExposure[trade.symbol].risk += trade.max_risk_amount || 0;
    });

    const portfolio_heat_map = Object.entries(symbolExposure).map(([symbol, data]) => ({
      symbol,
      exposure: data.exposure,
      risk: data.risk,
      percentage: (data.exposure / total_exposure) * 100
    })).sort((a, b) => b.percentage - a.percentage);

    setPortfolioRisk({
      total_exposure,
      max_risk_per_trade,
      recommended_position_size,
      portfolio_heat_map
    });
  };

  const getRiskLevel = (percentage: number) => {
    if (percentage <= 5) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (percentage <= 15) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Risk Management</h3>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">Portfolio Protection</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calculator'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Position Sizing
            </div>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'portfolio'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Portfolio Risk
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'calculator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Position Sizing Calculator */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Position Size Calculator</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Size
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    value={positionSizing.account_size}
                    onChange={(e) => setPositionSizing(prev => ({ ...prev, account_size: Number(e.target.value) }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Per Trade (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    step="0.1"
                    value={positionSizing.risk_per_trade}
                    onChange={(e) => setPositionSizing(prev => ({ ...prev, risk_per_trade: Number(e.target.value) }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={positionSizing.entry_price}
                    onChange={(e) => setPositionSizing(prev => ({ ...prev, entry_price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stop Loss
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={positionSizing.stop_loss}
                    onChange={(e) => setPositionSizing(prev => ({ ...prev, stop_loss: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Position Size Results</h4>
            
            {positionSizing.entry_price > 0 && positionSizing.stop_loss > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Risk Amount</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(positionSizing.risk_amount)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Position Size</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(positionSizing.position_size)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Number of Shares</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {positionSizing.shares.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Risk Percentage</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {positionSizing.risk_percent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      <strong>Risk Warning:</strong> Never risk more than 2% of your account on a single trade.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Enter entry price and stop loss to calculate position size</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Portfolio Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Exposure</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(portfolioRisk.total_exposure)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Max Risk Per Trade</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(portfolioRisk.max_risk_per_trade)}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recommended Position</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolioRisk.recommended_position_size.toFixed(1)}%
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Portfolio Heat Map */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Portfolio Exposure Heat Map</h4>
            
            {portfolioRisk.portfolio_heat_map.length > 0 ? (
              <div className="space-y-3">
                {portfolioRisk.portfolio_heat_map.map((item, index) => {
                  const riskLevel = getRiskLevel(item.percentage);
                  return (
                    <div key={item.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${riskLevel.bg}`} />
                        <span className="font-medium text-gray-900">{item.symbol}</span>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Exposure</p>
                          <p className="font-medium">{formatCurrency(item.exposure)}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Risk</p>
                          <p className="font-medium">{formatCurrency(item.risk)}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">% of Portfolio</p>
                          <p className={`font-medium ${riskLevel.color}`}>
                            {item.percentage.toFixed(1)}%
                          </p>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskLevel.bg} ${riskLevel.color}`}>
                          {riskLevel.level}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No trades found for portfolio analysis</p>
              </div>
            )}
          </div>

          {/* Risk Guidelines */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-blue-900 mb-3">Risk Management Guidelines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-2">Position Sizing Rules:</p>
                <ul className="space-y-1">
                  <li>• Never risk more than 2% per trade</li>
                  <li>• Use stop losses on every position</li>
                  <li>• Calculate position size before entry</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Portfolio Management:</p>
                <ul className="space-y-1">
                  <li>• Diversify across multiple symbols</li>
                  <li>• Monitor total portfolio exposure</li>
                  <li>• Rebalance when positions grow large</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 