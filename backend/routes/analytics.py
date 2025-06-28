from flask import Blueprint, request, jsonify, session
from datetime import datetime, timedelta
from models.trade import Trade
from models.performance import PerformanceAnalytics
from extensions import db
from functools import wraps
import json
import math

analytics_bp = Blueprint('analytics', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@analytics_bp.route('/performance', methods=['GET'])
@login_required
def get_performance():
    """Get overall performance analytics"""
    try:
        # Get date range from query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Calculate performance metrics
        performance = PerformanceAnalytics.calculate_performance(
            session['user_id'], start_date, end_date
        )
        
        if not performance:
            return jsonify({
                'message': 'No trades found for the specified period',
                'performance': {
                    'total_trades': 0,
                    'winning_trades': 0,
                    'losing_trades': 0,
                    'win_rate': 0,
                    'total_pnl': 0,
                    'gross_profit': 0,
                    'gross_loss': 0,
                    'average_win': 0,
                    'average_loss': 0,
                    'largest_win': 0,
                    'largest_loss': 0,
                    'max_drawdown': 0,
                    'max_drawdown_percent': 0,
                    'profit_factor': 0,
                    'expectancy': 0,
                    'longest_winning_streak': 0,
                    'longest_losing_streak': 0,
                    'current_streak': 0,
                    'current_streak_type': 'none',
                    'strategy_breakdown': {}
                }
            }), 200
        
        # Parse strategy breakdown
        if performance.get('strategy_breakdown'):
            performance['strategy_breakdown'] = json.loads(performance['strategy_breakdown'])
        
        return jsonify({
            'message': 'Performance analytics retrieved successfully',
            'performance': performance
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/performance/monthly', methods=['GET'])
@login_required
def get_monthly_performance():
    """Get monthly performance breakdown"""
    try:
        year = request.args.get('year', datetime.now().year)
        
        # Get all trades for the year
        start_date = datetime(int(year), 1, 1).date()
        end_date = datetime(int(year), 12, 31).date()
        
        trades = Trade.query.filter(
            Trade.user_id == session['user_id'],
            Trade.date >= start_date,
            Trade.date <= end_date
        ).order_by(Trade.date).all()
        
        monthly_data = {}
        
        for month in range(1, 13):
            month_start = datetime(int(year), month, 1).date()
            if month == 12:
                month_end = datetime(int(year), month, 31).date()
            else:
                month_end = datetime(int(year), month + 1, 1).date() - timedelta(days=1)
            
            month_trades = [t for t in trades if month_start <= t.date <= month_end]
            
            if month_trades:
                performance = PerformanceAnalytics.calculate_performance(
                    session['user_id'], month_start, month_end
                )
                monthly_data[month] = {
                    'month': month,
                    'month_name': datetime(int(year), month, 1).strftime('%B'),
                    'performance': performance
                }
            else:
                monthly_data[month] = {
                    'month': month,
                    'month_name': datetime(int(year), month, 1).strftime('%B'),
                    'performance': None
                }
        
        return jsonify({
            'message': 'Monthly performance retrieved successfully',
            'year': year,
            'monthly_data': monthly_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/performance/strategy', methods=['GET'])
@login_required
def get_strategy_performance():
    """Get performance breakdown by strategy"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        query = Trade.query.filter(Trade.user_id == session['user_id'])
        
        if start_date:
            query = query.filter(Trade.date >= start_date)
        if end_date:
            query = query.filter(Trade.date <= end_date)
        
        trades = query.all()
        
        strategy_stats = {}
        
        for trade in trades:
            strategy = trade.strategy or 'Unknown'
            if strategy not in strategy_stats:
                strategy_stats[strategy] = {
                    'total_trades': 0,
                    'winning_trades': 0,
                    'losing_trades': 0,
                    'total_pnl': 0,
                    'win_rate': 0,
                    'average_win': 0,
                    'average_loss': 0,
                    'largest_win': 0,
                    'largest_loss': 0,
                    'profit_factor': 0,
                    'total_volume': 0,
                    'avg_holding_period': 0
                }
            
            stats = strategy_stats[strategy]
            stats['total_trades'] += 1
            stats['total_pnl'] += trade.profit_loss
            stats['total_volume'] += trade.size
            
            if trade.is_winning_trade:
                stats['winning_trades'] += 1
                if trade.profit_loss > stats['largest_win']:
                    stats['largest_win'] = trade.profit_loss
            else:
                stats['losing_trades'] += 1
                if trade.profit_loss < stats['largest_loss']:
                    stats['largest_loss'] = trade.profit_loss
        
        # Calculate derived metrics
        for strategy in strategy_stats:
            stats = strategy_stats[strategy]
            if stats['total_trades'] > 0:
                stats['win_rate'] = (stats['winning_trades'] / stats['total_trades']) * 100
                
                # Calculate average win/loss
                winning_trades = [t for t in trades if t.strategy == strategy and t.is_winning_trade]
                losing_trades = [t for t in trades if t.strategy == strategy and not t.is_winning_trade]
                
                if winning_trades:
                    stats['average_win'] = sum(t.profit_loss for t in winning_trades) / len(winning_trades)
                if losing_trades:
                    stats['average_loss'] = sum(t.profit_loss for t in losing_trades) / len(losing_trades)
                
                # Calculate profit factor
                gross_profit = sum(t.profit_loss for t in winning_trades) if winning_trades else 0
                gross_loss = abs(sum(t.profit_loss for t in losing_trades)) if losing_trades else 0
                stats['profit_factor'] = (gross_profit / gross_loss) if gross_loss > 0 else 999999
        
        # Ensure no NaN or Infinity values in strategy stats
        for strategy in strategy_stats:
            for key, value in strategy_stats[strategy].items():
                if isinstance(value, (int, float)) and (math.isnan(value) or math.isinf(value)):
                    if key == 'profit_factor':
                        strategy_stats[strategy][key] = 999999
                    else:
                        strategy_stats[strategy][key] = 0
        
        return jsonify({
            'message': 'Strategy performance retrieved successfully',
            'strategy_stats': strategy_stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/performance/equity-curve', methods=['GET'])
@login_required
def get_equity_curve():
    """Get equity curve data for charting"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        query = Trade.query.filter(Trade.user_id == session['user_id'])
        
        if start_date:
            query = query.filter(Trade.date >= start_date)
        if end_date:
            query = query.filter(Trade.date <= end_date)
        
        trades = query.order_by(Trade.date).all()
        
        equity_curve = []
        cumulative_pnl = 0
        peak = 0
        
        for trade in trades:
            cumulative_pnl += trade.profit_loss
            if cumulative_pnl > peak:
                peak = cumulative_pnl
            
            drawdown = peak - cumulative_pnl
            drawdown_percent = (drawdown / peak * 100) if peak > 0 else 0
            
            equity_curve.append({
                'date': trade.date.isoformat(),
                'trade_id': trade.id,
                'symbol': trade.symbol,
                'pnl': trade.profit_loss,
                'cumulative_pnl': cumulative_pnl,
                'peak': peak,
                'drawdown': drawdown,
                'drawdown_percent': drawdown_percent
            })
        
        return jsonify({
            'message': 'Equity curve data retrieved successfully',
            'equity_curve': equity_curve
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/performance/risk-metrics', methods=['GET'])
@login_required
def get_risk_metrics():
    """Get detailed risk metrics"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        query = Trade.query.filter(Trade.user_id == session['user_id'])
        
        if start_date:
            query = query.filter(Trade.date >= start_date)
        if end_date:
            query = query.filter(Trade.date <= end_date)
        
        trades = query.all()
        
        if not trades:
            return jsonify({
                'message': 'No trades found for risk analysis',
                'risk_metrics': {}
            }), 200
        
        # Calculate risk metrics
        total_risk = sum(t.max_risk_amount for t in trades if t.max_risk_amount)
        actual_risk = sum(abs(t.profit_loss) for t in trades if not t.is_winning_trade)
        total_exposure = sum(t.entry_price * t.size for t in trades)
        
        # Calculate average risk per trade
        trades_with_risk = [t for t in trades if t.max_risk_amount]
        avg_risk_per_trade = (total_risk / len(trades_with_risk)) if trades_with_risk else 0
        
        # Calculate risk-adjusted returns
        total_return = sum(t.profit_loss for t in trades)
        risk_adjusted_return = (total_return / total_risk) if total_risk > 0 else 0
        
        # Calculate volatility (standard deviation of returns)
        returns = [t.profit_loss for t in trades]
        if len(returns) > 1:
            mean_return = sum(returns) / len(returns)
            variance = sum((r - mean_return) ** 2 for r in returns) / (len(returns) - 1)
            volatility = variance ** 0.5
        else:
            volatility = 0
        
        risk_metrics = {
            'total_risk': total_risk,
            'actual_risk': actual_risk,
            'total_exposure': total_exposure,
            'avg_risk_per_trade': avg_risk_per_trade,
            'risk_adjusted_return': risk_adjusted_return,
            'volatility': volatility,
            'risk_efficiency': (total_return / actual_risk) if actual_risk > 0 else 0,
            'exposure_ratio': (total_exposure / total_risk) if total_risk > 0 else 0
        }
        
        # Ensure no NaN or Infinity values
        for key, value in risk_metrics.items():
            if not isinstance(value, (int, float)) or math.isnan(value) or math.isinf(value):
                risk_metrics[key] = 0
        
        return jsonify({
            'message': 'Risk metrics retrieved successfully',
            'risk_metrics': risk_metrics
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 