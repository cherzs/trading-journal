import React, { useState, useEffect } from 'react';
import { Filter, Plus, Save, Trash2 } from 'lucide-react';

interface FilterCondition {
  field: string;
  operator: string;
  value: string | number | boolean;
}

interface SavedFilter {
  id: string;
  name: string;
  conditions: FilterCondition[];
  created_at: string;
}

interface AdvancedFiltersProps {
  onApplyFilters: (conditions: FilterCondition[]) => void;
  onClearFilters: () => void;
  strategies: string[];
  symbols: string[];
}

const FILTER_FIELDS = [
  { value: 'symbol', label: 'Symbol', type: 'select' },
  { value: 'strategy', label: 'Strategy', type: 'select' },
  { value: 'trade_type', label: 'Trade Type', type: 'select' },
  { value: 'profit_loss', label: 'P&L', type: 'number' },
  { value: 'profit_loss_percentage', label: 'P&L %', type: 'number' },
  { value: 'size', label: 'Size', type: 'number' },
  { value: 'entry_price', label: 'Entry Price', type: 'number' },
  { value: 'exit_price', label: 'Exit Price', type: 'number' },
  { value: 'date', label: 'Date', type: 'date' },
  { value: 'is_winning_trade', label: 'Result', type: 'boolean' },
  { value: 'emotional_state', label: 'Emotional State', type: 'number' },
  { value: 'confidence_level', label: 'Confidence Level', type: 'number' },
  { value: 'setup_quality', label: 'Setup Quality', type: 'number' },
  { value: 'execution_quality', label: 'Execution Quality', type: 'number' },
  { value: 'market_condition', label: 'Market Condition', type: 'select' },
  { value: 'timeframe', label: 'Timeframe', type: 'select' },
  { value: 'notes', label: 'Notes', type: 'text' }
];

const OPERATORS = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'equals', label: 'Equals' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'greater_than_or_equal', label: 'Greater than or equal' },
    { value: 'less_than_or_equal', label: 'Less than or equal' },
    { value: 'between', label: 'Between' }
  ],
  date: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'greater_than', label: 'After' },
    { value: 'less_than', label: 'Before' },
    { value: 'between', label: 'Between' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'this_month', label: 'This month' },
    { value: 'this_year', label: 'This year' }
  ],
  boolean: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is not' }
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'in', label: 'In' },
    { value: 'not_in', label: 'Not in' }
  ]
};

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onApplyFilters,
  onClearFilters,
  strategies,
  symbols
}) => {
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load saved filters from localStorage
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save filters to localStorage
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      { field: 'symbol', operator: 'equals', value: '' }
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, value: string | number | boolean) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const getFieldType = (fieldName: string) => {
    const field = FILTER_FIELDS.find(f => f.value === fieldName);
    return field?.type || 'text';
  };

  const getOperators = (fieldName: string) => {
    const fieldType = getFieldType(fieldName);
    return OPERATORS[fieldType as keyof typeof OPERATORS] || OPERATORS.text;
  };

  const renderValueInput = (condition: FilterCondition, index: number) => {
    const fieldType = getFieldType(condition.field);

    switch (fieldType) {
      case 'select':
        if (condition.field === 'symbol') {
          return (
            <select
              value={condition.value as string}
              onChange={(e) => updateCondition(index, 'value', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select symbol</option>
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          );
        } else if (condition.field === 'strategy') {
          return (
            <select
              value={condition.value as string}
              onChange={(e) => updateCondition(index, 'value', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select strategy</option>
              {strategies.map(strategy => (
                <option key={strategy} value={strategy}>{strategy}</option>
              ))}
            </select>
          );
        } else if (condition.field === 'trade_type') {
          return (
            <select
              value={condition.value as string}
              onChange={(e) => updateCondition(index, 'value', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          );
        } else if (condition.field === 'market_condition') {
          return (
            <select
              value={condition.value as string}
              onChange={(e) => updateCondition(index, 'value', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select condition</option>
              <option value="bull">Bull</option>
              <option value="bear">Bear</option>
              <option value="sideways">Sideways</option>
            </select>
          );
        } else if (condition.field === 'timeframe') {
          return (
            <select
              value={condition.value as string}
              onChange={(e) => updateCondition(index, 'value', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select timeframe</option>
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
          );
        }
        break;

      case 'boolean':
        return (
          <select
            value={condition.value as string}
            onChange={(e) => updateCondition(index, 'value', e.target.value === 'true')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={condition.value as string}
            onChange={(e) => updateCondition(index, 'value', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            step="any"
            value={condition.value as string}
            onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value) || 0)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter value"
          />
        );

      default:
        return (
          <input
            type="text"
            value={condition.value as string}
            onChange={(e) => updateCondition(index, 'value', e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            placeholder="Enter value"
          />
        );
    }
  };

  const handleApplyFilters = () => {
    const validConditions = conditions.filter(c => c.value !== '' && c.value !== null);
    onApplyFilters(validConditions);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const newFilter: SavedFilter = {
        id: Date.now().toString(),
        name: filterName,
        conditions: [...conditions],
        created_at: new Date().toISOString()
      };
      setSavedFilters([...savedFilters, newFilter]);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    setConditions(filter.conditions);
  };

  const handleDeleteFilter = (id: string) => {
    setSavedFilters(savedFilters.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
          {conditions.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {conditions.length}
            </span>
          )}
        </button>

        {conditions.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                setConditions([]);
                onClearFilters();
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Saved Filters</h4>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map(filter => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-lg"
                  >
                    <button
                      onClick={() => handleLoadFilter(filter)}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {filter.name}
                    </button>
                    <button
                      onClick={() => handleDeleteFilter(filter.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Conditions */}
          <div className="space-y-3">
            {conditions.map((condition, index) => (
              <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <select
                  value={condition.field}
                  onChange={(e) => updateCondition(index, 'field', e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  {FILTER_FIELDS.map(field => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>

                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  {getOperators(condition.field).map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                <div className="flex-1">
                  {renderValueInput(condition, index)}
                </div>

                <button
                  onClick={() => removeCondition(index)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Condition Button */}
          <button
            onClick={addCondition}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Condition
          </button>

          {/* Save Filter Button */}
          {conditions.length > 0 && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg"
            >
              <Save className="w-4 h-4" />
              Save Filter
            </button>
          )}
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Save Filter</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveFilter}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterName('');
                }}
                className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
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