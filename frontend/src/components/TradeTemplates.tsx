import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit, Trash2, Copy } from 'lucide-react';

interface TradeTemplate {
  id: number;
  name: string;
  strategy: string;
  trade_type: 'long' | 'short';
  default_size: number;
  default_stop_loss_percent: number;
  default_take_profit_percent: number;
  timeframe: string;
  notes: string;
  created_at: string;
}

interface TradeTemplatesProps {
  onSelectTemplate: (template: TradeTemplate) => void;
  onSaveTemplate: (template: Omit<TradeTemplate, 'id' | 'created_at'>) => void;
  onDeleteTemplate: (id: number) => void;
  currentTrade?: any;
}

export const TradeTemplates: React.FC<TradeTemplatesProps> = ({
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  currentTrade
}) => {
  const [templates, setTemplates] = useState<TradeTemplate[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TradeTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    strategy: '',
    trade_type: 'long' as 'long' | 'short',
    default_size: 100,
    default_stop_loss_percent: 2,
    default_take_profit_percent: 6,
    timeframe: '1h',
    notes: ''
  });

  useEffect(() => {
    // Load templates from localStorage
    const savedTemplates = localStorage.getItem('tradeTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  useEffect(() => {
    // Save templates to localStorage
    localStorage.setItem('tradeTemplates', JSON.stringify(templates));
  }, [templates]);

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      // Update existing template
      const updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...formData, id: editingTemplate.id, created_at: editingTemplate.created_at }
          : t
      );
      setTemplates(updatedTemplates);
      onSaveTemplate(formData);
    } else {
      // Create new template
      const newTemplate: TradeTemplate = {
        ...formData,
        id: Date.now(),
        created_at: new Date().toISOString()
      };
      setTemplates([...templates, newTemplate]);
      onSaveTemplate(formData);
    }
    
    setShowSaveForm(false);
    setEditingTemplate(null);
    resetForm();
  };

  const handleDeleteTemplate = (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
      onDeleteTemplate(id);
    }
  };

  const handleEditTemplate = (template: TradeTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      strategy: template.strategy,
      trade_type: template.trade_type,
      default_size: template.default_size,
      default_stop_loss_percent: template.default_stop_loss_percent,
      default_take_profit_percent: template.default_take_profit_percent,
      timeframe: template.timeframe,
      notes: template.notes
    });
    setShowSaveForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      strategy: '',
      trade_type: 'long',
      default_size: 100,
      default_stop_loss_percent: 2,
      default_take_profit_percent: 6,
      timeframe: '1h',
      notes: ''
    });
  };

  const handleCreateFromCurrent = () => {
    if (currentTrade) {
      setFormData({
        name: `${currentTrade.strategy} - ${currentTrade.symbol}`,
        strategy: currentTrade.strategy,
        trade_type: currentTrade.trade_type,
        default_size: currentTrade.size,
        default_stop_loss_percent: currentTrade.stop_loss_percent || 2,
        default_take_profit_percent: currentTrade.take_profit_percent || 6,
        timeframe: currentTrade.timeframe || '1h',
        notes: currentTrade.notes || ''
      });
      setShowSaveForm(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Trade Templates</h3>
        <div className="flex gap-2">
          {currentTrade && (
            <button
              onClick={handleCreateFromCurrent}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save Current
            </button>
          )}
          <button
            onClick={() => setShowSaveForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <div className="flex gap-1">
                <button
                  onClick={() => onSelectTemplate(template)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Use template"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Edit template"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Delete template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Strategy:</span>
                <span className="font-medium">{template.strategy}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className={`font-medium ${
                  template.trade_type === 'long' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {template.trade_type.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium">{template.default_size}</span>
              </div>
              <div className="flex justify-between">
                <span>SL/TP:</span>
                <span className="font-medium">
                  {template.default_stop_loss_percent}% / {template.default_take_profit_percent}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Timeframe:</span>
                <span className="font-medium">{template.timeframe}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No templates saved yet.</p>
          <p className="text-sm">Create your first template to speed up trade entry.</p>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingTemplate ? 'Edit Template' : 'Save Template'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Breakout Strategy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strategy
                </label>
                <input
                  type="text"
                  value={formData.strategy}
                  onChange={(e) => setFormData({...formData, strategy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Breakout"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trade Type
                  </label>
                  <select
                    value={formData.trade_type}
                    onChange={(e) => setFormData({...formData, trade_type: e.target.value as 'long' | 'short'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeframe
                  </label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData({...formData, timeframe: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                    <option value="4h">4h</option>
                    <option value="1d">1d</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Size
                  </label>
                  <input
                    type="number"
                    value={formData.default_size}
                    onChange={(e) => setFormData({...formData, default_size: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SL %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.default_stop_loss_percent}
                    onChange={(e) => setFormData({...formData, default_stop_loss_percent: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TP %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.default_take_profit_percent}
                    onChange={(e) => setFormData({...formData, default_take_profit_percent: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Template notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveTemplate}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                {editingTemplate ? 'Update' : 'Save'} Template
              </button>
              <button
                onClick={() => {
                  setShowSaveForm(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 