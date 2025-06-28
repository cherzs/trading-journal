import React, { useState, useEffect } from 'react';
import { Plus, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Trade } from '../types/Trade';
import { ScreenshotUpload } from './ScreenshotUpload';
import { uploadApi } from '../utils/uploadApi';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id'>) => void;
  onClose: () => void;
  editingTrade?: Trade;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, onClose, editingTrade }) => {
  const [formData, setFormData] = useState({
    // Basic Trade Info
    symbol: '',
    trade_type: 'long' as 'long' | 'short',
    broker: '',
    entry_price: '',
    exit_price: '',
    size: '',
    date: '',
    
    // Risk Management
    stop_loss: '',
    take_profit: '',
    position_size_percent: '',
    risk_per_trade: '',
    risk_percent: '',
    
    // Market Context
    market_condition: '' as 'bull' | 'bear' | 'sideways' | '',
    volatility_index: '',
    sector: '',
    market_sentiment: '' as 'bullish' | 'bearish' | 'neutral' | '',
    
    // Technical Analysis
    strategy: '',
    entry_reason: '',
    exit_reason: '',
    technical_indicators: '',
    chart_patterns: '',
    timeframe: '',
    volume_confirmation: false,
    
    // Emotional & Psychological
    emotional_state: '',
    confidence_level: '',
    stress_level: '',
    setup_quality: '',
    execution_quality: '',
    
    // Trade Management
    holding_period: '',
    trailing_stop: false,
    breakeven_stop: false,
    
    // Analysis & Lessons
    notes: '',
    lessons_learned: '',
    what_worked: '',
    what_didnt_work: '',
    next_time_improvements: ''
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    risk: false,
    market: false,
    technical: false,
    psychological: false,
    analysis: false,
    screenshot: false
  });

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPath, setScreenshotPath] = useState<string | undefined>(editingTrade?.screenshot_path);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  useEffect(() => {
    if (editingTrade) {
      setFormData({
        symbol: editingTrade.symbol,
        trade_type: editingTrade.trade_type,
        broker: editingTrade.broker || '',
        entry_price: editingTrade.entry_price.toString(),
        exit_price: editingTrade.exit_price.toString(),
        size: editingTrade.size.toString(),
        date: editingTrade.date,
        stop_loss: editingTrade.stop_loss?.toString() || '',
        take_profit: editingTrade.take_profit?.toString() || '',
        position_size_percent: editingTrade.position_size_percent?.toString() || '',
        risk_per_trade: editingTrade.risk_per_trade?.toString() || '',
        risk_percent: editingTrade.risk_percent?.toString() || '',
        market_condition: editingTrade.market_condition || '',
        volatility_index: editingTrade.volatility_index?.toString() || '',
        sector: editingTrade.sector || '',
        market_sentiment: editingTrade.market_sentiment || '',
        strategy: editingTrade.strategy,
        entry_reason: editingTrade.entry_reason || '',
        exit_reason: editingTrade.exit_reason || '',
        technical_indicators: editingTrade.technical_indicators || '',
        chart_patterns: editingTrade.chart_patterns || '',
        timeframe: editingTrade.timeframe || '',
        volume_confirmation: editingTrade.volume_confirmation || false,
        emotional_state: editingTrade.emotional_state?.toString() || '',
        confidence_level: editingTrade.confidence_level?.toString() || '',
        stress_level: editingTrade.stress_level?.toString() || '',
        setup_quality: editingTrade.setup_quality?.toString() || '',
        execution_quality: editingTrade.execution_quality?.toString() || '',
        holding_period: editingTrade.holding_period?.toString() || '',
        trailing_stop: editingTrade.trailing_stop || false,
        breakeven_stop: editingTrade.breakeven_stop || false,
        notes: editingTrade.notes || '',
        lessons_learned: editingTrade.lessons_learned || '',
        what_worked: editingTrade.what_worked || '',
        what_didnt_work: editingTrade.what_didnt_work || '',
        next_time_improvements: editingTrade.next_time_improvements || ''
      });
      setScreenshotPath(editingTrade.screenshot_path);
    }
  }, [editingTrade]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleScreenshotUpload = async (file: File) => {
    setScreenshotFile(file);
    setUploadingScreenshot(true);
    
    try {
      const result = await uploadApi.uploadScreenshot(file);
      setScreenshotPath(result.filename);
    } catch (error) {
      console.error('Failed to upload screenshot:', error);
      alert('Failed to upload screenshot. Please try again.');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleScreenshotRemove = () => {
    setScreenshotFile(null);
    setScreenshotPath(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Upload screenshot if there's a new file
    let finalScreenshotPath = screenshotPath;
    if (screenshotFile && !screenshotPath) {
      try {
        const result = await uploadApi.uploadScreenshot(screenshotFile);
        finalScreenshotPath = result.filename;
      } catch (error) {
        console.error('Failed to upload screenshot:', error);
        alert('Failed to upload screenshot. Please try again.');
        return;
      }
    }
    
    const trade: Omit<Trade, 'id'> = {
      user_id: 0, // Will be set by backend
      symbol: formData.symbol.toUpperCase(),
      trade_type: formData.trade_type,
      broker: formData.broker || undefined,
      entry_price: parseFloat(formData.entry_price),
      exit_price: parseFloat(formData.exit_price),
      size: parseFloat(formData.size),
      date: formData.date,
      stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : undefined,
      take_profit: formData.take_profit ? parseFloat(formData.take_profit) : undefined,
      position_size_percent: formData.position_size_percent ? parseFloat(formData.position_size_percent) : undefined,
      risk_per_trade: formData.risk_per_trade ? parseFloat(formData.risk_per_trade) : undefined,
      risk_percent: formData.risk_percent ? parseFloat(formData.risk_percent) : undefined,
      market_condition: formData.market_condition || undefined,
      volatility_index: formData.volatility_index ? parseFloat(formData.volatility_index) : undefined,
      sector: formData.sector || undefined,
      market_sentiment: formData.market_sentiment || undefined,
      strategy: formData.strategy,
      entry_reason: formData.entry_reason || undefined,
      exit_reason: formData.exit_reason || undefined,
      technical_indicators: formData.technical_indicators || undefined,
      chart_patterns: formData.chart_patterns || undefined,
      timeframe: formData.timeframe || undefined,
      volume_confirmation: formData.volume_confirmation,
      emotional_state: formData.emotional_state ? parseInt(formData.emotional_state) : undefined,
      confidence_level: formData.confidence_level ? parseInt(formData.confidence_level) : undefined,
      stress_level: formData.stress_level ? parseInt(formData.stress_level) : undefined,
      setup_quality: formData.setup_quality ? parseInt(formData.setup_quality) : undefined,
      execution_quality: formData.execution_quality ? parseInt(formData.execution_quality) : undefined,
      holding_period: formData.holding_period ? parseInt(formData.holding_period) : undefined,
      trailing_stop: formData.trailing_stop,
      breakeven_stop: formData.breakeven_stop,
      notes: formData.notes || undefined,
      lessons_learned: formData.lessons_learned || undefined,
      what_worked: formData.what_worked || undefined,
      what_didnt_work: formData.what_didnt_work || undefined,
      next_time_improvements: formData.next_time_improvements || undefined,
      screenshot_path: finalScreenshotPath,
      profit_loss: 0,
      profit_loss_percentage: 0,
      risk_reward_ratio: undefined,
      is_winning_trade: false,
      max_risk_amount: 0,
      actual_risk_reward: undefined,
      created_at: '',
      updated_at: ''
    };

    onSubmit(trade);
  };

  const renderSectionHeader = (title: string, section: keyof typeof expandedSections) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {editingTrade ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            {editingTrade ? 'Edit Trade' : 'Add New Trade'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Trade Information */}
          <div>
            {renderSectionHeader('Basic Trade Information', 'basic')}
            {expandedSections.basic && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Symbol *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.symbol}
                      onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AAPL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trade Type *
                    </label>
                    <select
                      required
                      value={formData.trade_type}
                      onChange={(e) => setFormData({...formData, trade_type: e.target.value as 'long' | 'short'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entry Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.entry_price}
                      onChange={(e) => setFormData({...formData, entry_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="150.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exit Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.exit_price}
                      onChange={(e) => setFormData({...formData, exit_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="155.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Broker
                    </label>
                    <input
                      type="text"
                      value={formData.broker}
                      onChange={(e) => setFormData({...formData, broker: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Interactive Brokers"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Screenshot Upload */}
          <div>
            {renderSectionHeader('Trade Screenshot', 'screenshot')}
            {expandedSections.screenshot && (
              <div className="mt-4">
                <ScreenshotUpload
                  onUpload={handleScreenshotUpload}
                  onRemove={handleScreenshotRemove}
                  currentScreenshot={screenshotPath ? uploadApi.getScreenshotUrl(screenshotPath) : undefined}
                  disabled={uploadingScreenshot}
                />
              </div>
            )}
          </div>

          {/* Risk Management */}
          <div>
            {renderSectionHeader('Risk Management', 'risk')}
            {expandedSections.risk && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stop Loss
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.stop_loss}
                      onChange={(e) => setFormData({...formData, stop_loss: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="145.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Take Profit
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.take_profit}
                      onChange={(e) => setFormData({...formData, take_profit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="160.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position Size (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.position_size_percent}
                      onChange={(e) => setFormData({...formData, position_size_percent: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Per Trade ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.risk_per_trade}
                      onChange={(e) => setFormData({...formData, risk_per_trade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.risk_percent}
                      onChange={(e) => setFormData({...formData, risk_percent: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1.0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Market Context */}
          <div>
            {renderSectionHeader('Market Context', 'market')}
            {expandedSections.market && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Market Condition
                    </label>
                    <select
                      value={formData.market_condition}
                      onChange={(e) => setFormData({...formData, market_condition: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select condition</option>
                      <option value="bull">Bull Market</option>
                      <option value="bear">Bear Market</option>
                      <option value="sideways">Sideways</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Market Sentiment
                    </label>
                    <select
                      value={formData.market_sentiment}
                      onChange={(e) => setFormData({...formData, market_sentiment: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select sentiment</option>
                      <option value="bullish">Bullish</option>
                      <option value="bearish">Bearish</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volatility Index
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.volatility_index}
                      onChange={(e) => setFormData({...formData, volatility_index: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sector
                    </label>
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => setFormData({...formData, sector: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Technology"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Technical Analysis */}
          <div>
            {renderSectionHeader('Technical Analysis', 'technical')}
            {expandedSections.technical && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strategy *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.strategy}
                    onChange={(e) => setFormData({...formData, strategy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Breakout Strategy"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entry Reason
                    </label>
                    <input
                      type="text"
                      value={formData.entry_reason}
                      onChange={(e) => setFormData({...formData, entry_reason: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Breakout above resistance"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exit Reason
                    </label>
                    <input
                      type="text"
                      value={formData.exit_reason}
                      onChange={(e) => setFormData({...formData, exit_reason: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Target reached"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Technical Indicators
                    </label>
                    <input
                      type="text"
                      value={formData.technical_indicators}
                      onChange={(e) => setFormData({...formData, technical_indicators: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="RSI, MACD, Moving Averages"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chart Patterns
                    </label>
                    <input
                      type="text"
                      value={formData.chart_patterns}
                      onChange={(e) => setFormData({...formData, chart_patterns: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Cup and Handle"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timeframe
                    </label>
                    <select
                      value={formData.timeframe}
                      onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select timeframe</option>
                      <option value="1m">1 minute</option>
                      <option value="5m">5 minutes</option>
                      <option value="15m">15 minutes</option>
                      <option value="1h">1 hour</option>
                      <option value="4h">4 hours</option>
                      <option value="1d">1 day</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.volume_confirmation}
                        onChange={(e) => setFormData({...formData, volume_confirmation: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Volume Confirmation</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Psychological & Emotional */}
          <div>
            {renderSectionHeader('Psychological & Emotional', 'psychological')}
            {expandedSections.psychological && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emotional State (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.emotional_state}
                      onChange={(e) => setFormData({...formData, emotional_state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="7"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confidence Level (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.confidence_level}
                      onChange={(e) => setFormData({...formData, confidence_level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stress Level (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.stress_level}
                      onChange={(e) => setFormData({...formData, stress_level: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Setup Quality (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.setup_quality}
                      onChange={(e) => setFormData({...formData, setup_quality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="9"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Execution Quality (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.execution_quality}
                      onChange={(e) => setFormData({...formData, execution_quality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Holding Period (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.holding_period}
                      onChange={(e) => setFormData({...formData, holding_period: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="24"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.trailing_stop}
                        onChange={(e) => setFormData({...formData, trailing_stop: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Trailing Stop</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.breakeven_stop}
                        onChange={(e) => setFormData({...formData, breakeven_stop: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Breakeven Stop</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analysis & Lessons */}
          <div>
            {renderSectionHeader('Analysis & Lessons', 'analysis')}
            {expandedSections.analysis && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="General notes about the trade..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lessons Learned
                  </label>
                  <textarea
                    rows={3}
                    value={formData.lessons_learned}
                    onChange={(e) => setFormData({...formData, lessons_learned: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What did you learn from this trade?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What Worked
                    </label>
                    <textarea
                      rows={3}
                      value={formData.what_worked}
                      onChange={(e) => setFormData({...formData, what_worked: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What aspects of the trade worked well?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What Didn't Work
                    </label>
                    <textarea
                      rows={3}
                      value={formData.what_didnt_work}
                      onChange={(e) => setFormData({...formData, what_didnt_work: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What aspects could have been better?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Time Improvements
                  </label>
                  <textarea
                    rows={3}
                    value={formData.next_time_improvements}
                    onChange={(e) => setFormData({...formData, next_time_improvements: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What would you do differently next time?"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingScreenshot}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploadingScreenshot ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  {editingTrade ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingTrade ? 'Update Trade' : 'Add Trade'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};