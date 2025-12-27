import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Percent, CheckCircle, XCircle } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  type: 'profit' | 'win_rate' | 'trades_count' | 'drawdown';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'failed';
  created_at: string;
}

interface GoalsTrackerProps {
  currentPerformance: {
    total_pnl: number;
    win_rate: number;
    total_trades: number;
    max_drawdown_percent: number;
  };
}

export const GoalsTracker: React.FC<GoalsTrackerProps> = ({ currentPerformance }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'profit' as Goal['type'],
    target: 0,
    period: 'monthly' as Goal['period'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    // Load goals from localStorage
    const savedGoals = localStorage.getItem('tradingGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  useEffect(() => {
    // Save goals to localStorage
    localStorage.setItem('tradingGoals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    // Update goal progress based on current performance
    const updatedGoals = goals.map(goal => {
      let current = 0;

      switch (goal.type) {
        case 'profit':
          current = currentPerformance.total_pnl;
          break;
        case 'win_rate':
          current = currentPerformance.win_rate;
          break;
        case 'trades_count':
          current = currentPerformance.total_trades;
          break;
        case 'drawdown':
          current = currentPerformance.max_drawdown_percent;
          break;
      }

      // Determine status
      let status: Goal['status'] = 'active';
      const now = new Date();
      const endDate = new Date(goal.end_date);

      if (now > endDate) {
        if (goal.type === 'drawdown') {
          status = current <= goal.target ? 'completed' : 'failed';
        } else {
          status = current >= goal.target ? 'completed' : 'failed';
        }
      }

      return { ...goal, current, status };
    });

    setGoals(updatedGoals);
  }, [currentPerformance]);

  const handleAddGoal = () => {
    if (formData.name && formData.target > 0) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        target: formData.target,
        current: 0,
        period: formData.period,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: 'active',
        created_at: new Date().toISOString()
      };

      setGoals([...goals, newGoal]);
      setShowAddGoal(false);
      resetForm();
    }
  };

  const handleUpdateGoal = () => {
    if (editingGoal && formData.name && formData.target > 0) {
      const updatedGoals = goals.map(goal =>
        goal.id === editingGoal.id
          ? { ...goal, ...formData }
          : goal
      );
      setGoals(updatedGoals);
      setShowAddGoal(false);
      setEditingGoal(null);
      resetForm();
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'profit',
      target: 0,
      period: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
  };

  const getProgressPercentage = (goal: Goal) => {
    if (goal.target === 0) return 0;

    if (goal.type === 'drawdown') {
      // For drawdown, we want to stay below target
      return Math.min(100, (goal.current / goal.target) * 100);
    } else {
      return Math.min(100, (goal.current / goal.target) * 100);
    }
  };

  const getGoalIcon = (type: Goal['type']) => {
    switch (type) {
      case 'profit':
        return <DollarSign className="w-5 h-5" />;
      case 'win_rate':
        return <Percent className="w-5 h-5" />;
      case 'trades_count':
        return <TrendingUp className="w-5 h-5" />;
      case 'drawdown':
        return <Target className="w-5 h-5" />;
    }
  };

  const getGoalUnit = (type: Goal['type']) => {
    switch (type) {
      case 'profit':
        return '$';
      case 'win_rate':
        return '%';
      case 'trades_count':
        return 'trades';
      case 'drawdown':
        return '%';
    }
  };

  const formatValue = (value: number, type: Goal['type']) => {
    switch (type) {
      case 'profit':
        return `$${value.toLocaleString()}`;
      case 'win_rate':
        return `${value.toFixed(1)}%`;
      case 'trades_count':
        return value.toString();
      case 'drawdown':
        return `${value.toFixed(2)}%`;
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return <Target className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trading Goals</h3>
        <button
          onClick={() => setShowAddGoal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = getProgressPercentage(goal);
          const isDrawdown = goal.type === 'drawdown';

          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-gray-600 dark:text-gray-400">
                    {getGoalIcon(goal.type)}
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{goal.name}</h4>
                </div>
                <div className={`flex items-center gap-1 ${getStatusColor(goal.status)}`}>
                  {getStatusIcon(goal.status)}
                  <span className="text-xs font-medium capitalize">{goal.status}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Current:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatValue(goal.current, goal.type)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Target:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatValue(goal.target, goal.type)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{progress.toFixed(1)}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${isDrawdown
                      ? progress <= 100 ? 'bg-green-500' : 'bg-red-500'
                      : progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="capitalize">{goal.period}</span>
                  <span>{new Date(goal.end_date).toLocaleDateString()}</span>
                </div>
              </div>

              {goal.status === 'active' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setFormData({
                        name: goal.name,
                        type: goal.type,
                        target: goal.target,
                        period: goal.period,
                        start_date: goal.start_date,
                        end_date: goal.end_date
                      });
                      setShowAddGoal(true);
                    }}
                    className="flex-1 px-3 py-1 text-sm bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="flex-1 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium mb-2">No goals set yet</p>
          <p className="text-sm">Set trading goals to track your progress and stay motivated.</p>
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="e.g., Monthly Profit Target"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Goal['type'] })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="profit">Profit Target</option>
                  <option value="win_rate">Win Rate</option>
                  <option value="trades_count">Number of Trades</option>
                  <option value="drawdown">Max Drawdown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder={`Enter target ${getGoalUnit(formData.type)}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as Goal['period'] })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingGoal ? 'Update' : 'Add'} Goal
              </button>
              <button
                onClick={() => {
                  setShowAddGoal(false);
                  setEditingGoal(null);
                  resetForm();
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