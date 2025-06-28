from extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, and_
from models.trade import Trade
import math

class PerformanceAnalytics(db.Model):
    __tablename__ = 'performance_analytics'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    period_start = db.Column(db.Date, nullable=False)
    period_end = db.Column(db.Date, nullable=False)
    period_type = db.Column(db.String(20), nullable=False)  # daily, weekly, monthly, yearly
    
    # Basic Statistics
    total_trades = db.Column(db.Integer, default=0)
    winning_trades = db.Column(db.Integer, default=0)
    losing_trades = db.Column(db.Integer, default=0)
    win_rate = db.Column(db.Float, default=0.0)
    
    # Profit/Loss Metrics
    total_pnl = db.Column(db.Float, default=0.0)
    gross_profit = db.Column(db.Float, default=0.0)
    gross_loss = db.Column(db.Float, default=0.0)
    average_win = db.Column(db.Float, default=0.0)
    average_loss = db.Column(db.Float, default=0.0)
    largest_win = db.Column(db.Float, default=0.0)
    largest_loss = db.Column(db.Float, default=0.0)
    
    # Risk Metrics
    max_drawdown = db.Column(db.Float, default=0.0)
    max_drawdown_percent = db.Column(db.Float, default=0.0)
    sharpe_ratio = db.Column(db.Float, default=0.0)
    sortino_ratio = db.Column(db.Float, default=0.0)
    calmar_ratio = db.Column(db.Float, default=0.0)
    
    # Trade Quality Metrics
    average_risk_reward = db.Column(db.Float, default=0.0)
    profit_factor = db.Column(db.Float, default=0.0)
    expectancy = db.Column(db.Float, default=0.0)
    
    # Streak Analysis
    longest_winning_streak = db.Column(db.Integer, default=0)
    longest_losing_streak = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    current_streak_type = db.Column(db.String(10), default='none')  # winning, losing, none
    
    # Strategy Performance
    strategy_breakdown = db.Column(db.Text, nullable=True)  # JSON string
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @classmethod
    def calculate_performance(cls, user_id, start_date=None, end_date=None):
        """Calculate performance metrics for a user"""
        query = Trade.query.filter(Trade.user_id == user_id)
        
        if start_date:
            query = query.filter(Trade.date >= start_date)
        if end_date:
            query = query.filter(Trade.date <= end_date)
            
        trades = query.all()
        
        if not trades:
            return None
            
        # Basic counts
        total_trades = len(trades)
        winning_trades = len([t for t in trades if t.is_winning_trade])
        losing_trades = total_trades - winning_trades
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        # P&L calculations
        total_pnl = sum(t.profit_loss for t in trades)
        winning_trade_pnls = [t.profit_loss for t in trades if t.is_winning_trade]
        losing_trade_pnls = [t.profit_loss for t in trades if not t.is_winning_trade]
        
        gross_profit = sum(winning_trade_pnls) if winning_trade_pnls else 0
        gross_loss = abs(sum(losing_trade_pnls)) if losing_trade_pnls else 0
        
        average_win = (gross_profit / len(winning_trade_pnls)) if winning_trade_pnls else 0
        average_loss = (gross_loss / len(losing_trade_pnls)) if losing_trade_pnls else 0
        
        largest_win = max(winning_trade_pnls) if winning_trade_pnls else 0
        largest_loss = min(losing_trade_pnls) if losing_trade_pnls else 0
        
        # Risk metrics
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else 999999  # Use large number instead of infinity
        expectancy = ((win_rate/100 * average_win) - ((1-win_rate/100) * average_loss)) if total_trades > 0 else 0
        
        # Ensure no NaN or Infinity values
        if not isinstance(profit_factor, (int, float)) or math.isnan(profit_factor) or math.isinf(profit_factor):
            profit_factor = 999999
        if not isinstance(expectancy, (int, float)) or math.isnan(expectancy) or math.isinf(expectancy):
            expectancy = 0
        
        # Calculate drawdown
        cumulative_pnl = 0
        peak = 0
        max_drawdown = 0
        max_drawdown_percent = 0
        
        for trade in trades:
            cumulative_pnl += trade.profit_loss
            if cumulative_pnl > peak:
                peak = cumulative_pnl
            
            drawdown = peak - cumulative_pnl
            if drawdown > max_drawdown:
                max_drawdown = drawdown
                max_drawdown_percent = (drawdown / peak * 100) if peak > 0 else 0
        
        # Calculate streaks
        current_streak = 0
        current_streak_type = 'none'
        longest_winning_streak = 0
        longest_losing_streak = 0
        temp_winning_streak = 0
        temp_losing_streak = 0
        
        for trade in trades:
            if trade.is_winning_trade:
                temp_winning_streak += 1
                temp_losing_streak = 0
                if temp_winning_streak > longest_winning_streak:
                    longest_winning_streak = temp_winning_streak
            else:
                temp_losing_streak += 1
                temp_winning_streak = 0
                if temp_losing_streak > longest_losing_streak:
                    longest_losing_streak = temp_losing_streak
        
        # Current streak (most recent)
        if trades:
            latest_trade = trades[-1]
            if latest_trade.is_winning_trade:
                current_streak_type = 'winning'
                # Count backwards
                for trade in reversed(trades):
                    if trade.is_winning_trade:
                        current_streak += 1
                    else:
                        break
            else:
                current_streak_type = 'losing'
                # Count backwards
                for trade in reversed(trades):
                    if not trade.is_winning_trade:
                        current_streak += 1
                    else:
                        break
        
        # Strategy breakdown
        strategy_stats = {}
        for trade in trades:
            strategy = trade.strategy or 'Unknown'
            if strategy not in strategy_stats:
                strategy_stats[strategy] = {
                    'total_trades': 0,
                    'winning_trades': 0,
                    'total_pnl': 0,
                    'win_rate': 0
                }
            
            strategy_stats[strategy]['total_trades'] += 1
            strategy_stats[strategy]['total_pnl'] += trade.profit_loss
            if trade.is_winning_trade:
                strategy_stats[strategy]['winning_trades'] += 1
        
        # Calculate win rates for strategies
        for strategy in strategy_stats:
            total = strategy_stats[strategy]['total_trades']
            wins = strategy_stats[strategy]['winning_trades']
            strategy_stats[strategy]['win_rate'] = (wins / total * 100) if total > 0 else 0
        
        import json
        strategy_breakdown = json.dumps(strategy_stats)
        
        return {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': win_rate,
            'total_pnl': total_pnl,
            'gross_profit': gross_profit,
            'gross_loss': gross_loss,
            'average_win': average_win,
            'average_loss': average_loss,
            'largest_win': largest_win,
            'largest_loss': largest_loss,
            'max_drawdown': max_drawdown,
            'max_drawdown_percent': max_drawdown_percent,
            'profit_factor': profit_factor,
            'expectancy': expectancy,
            'longest_winning_streak': longest_winning_streak,
            'longest_losing_streak': longest_losing_streak,
            'current_streak': current_streak,
            'current_streak_type': current_streak_type,
            'strategy_breakdown': strategy_breakdown
        }
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'period_type': self.period_type,
            'total_trades': self.total_trades,
            'winning_trades': self.winning_trades,
            'losing_trades': self.losing_trades,
            'win_rate': self.win_rate,
            'total_pnl': self.total_pnl,
            'gross_profit': self.gross_profit,
            'gross_loss': self.gross_loss,
            'average_win': self.average_win,
            'average_loss': self.average_loss,
            'largest_win': self.largest_win,
            'largest_loss': self.largest_loss,
            'max_drawdown': self.max_drawdown,
            'max_drawdown_percent': self.max_drawdown_percent,
            'sharpe_ratio': self.sharpe_ratio,
            'sortino_ratio': self.sortino_ratio,
            'calmar_ratio': self.calmar_ratio,
            'average_risk_reward': self.average_risk_reward,
            'profit_factor': self.profit_factor,
            'expectancy': self.expectancy,
            'longest_winning_streak': self.longest_winning_streak,
            'longest_losing_streak': self.longest_losing_streak,
            'current_streak': self.current_streak,
            'current_streak_type': self.current_streak_type,
            'strategy_breakdown': self.strategy_breakdown,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 