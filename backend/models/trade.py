from extensions import db
from datetime import datetime
from sqlalchemy import func

class Trade(db.Model):
    __tablename__ = 'trades'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    trade_type = db.Column(db.String(20), nullable=False)  # long, short
    broker = db.Column(db.String(50), nullable=True)
    entry_price = db.Column(db.Float, nullable=False)
    exit_price = db.Column(db.Float, nullable=False)
    size = db.Column(db.Float, nullable=False)
    stop_loss = db.Column(db.Float, nullable=True)
    take_profit = db.Column(db.Float, nullable=True)
    strategy = db.Column(db.String(100), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    screenshot_path = db.Column(db.String(200), nullable=True)
    
    # Enhanced Risk Management
    position_size_percent = db.Column(db.Float, nullable=True)  # % of portfolio
    risk_per_trade = db.Column(db.Float, nullable=True)  # Risk amount in currency
    risk_percent = db.Column(db.Float, nullable=True)  # Risk as % of portfolio
    
    # Market Context
    market_condition = db.Column(db.String(20), nullable=True)  # bull, bear, sideways
    volatility_index = db.Column(db.Float, nullable=True)  # VIX or similar
    sector = db.Column(db.String(50), nullable=True)
    market_sentiment = db.Column(db.String(20), nullable=True)  # bullish, bearish, neutral
    
    # Technical Analysis
    entry_reason = db.Column(db.String(200), nullable=True)  # breakout, support, etc.
    exit_reason = db.Column(db.String(200), nullable=True)
    technical_indicators = db.Column(db.Text, nullable=True)  # JSON string of indicators
    chart_patterns = db.Column(db.String(200), nullable=True)
    timeframe = db.Column(db.String(20), nullable=True)  # 1m, 5m, 1h, 1d, etc.
    volume_confirmation = db.Column(db.Boolean, nullable=True)
    
    # Emotional & Psychological Tracking
    emotional_state = db.Column(db.Integer, nullable=True)  # 1-10 scale
    confidence_level = db.Column(db.Integer, nullable=True)  # 1-10 scale
    stress_level = db.Column(db.Integer, nullable=True)  # 1-10 scale
    setup_quality = db.Column(db.Integer, nullable=True)  # 1-10 scale
    execution_quality = db.Column(db.Integer, nullable=True)  # 1-10 scale
    
    # Trade Management
    holding_period = db.Column(db.Integer, nullable=True)  # in hours/days
    partial_exits = db.Column(db.Text, nullable=True)  # JSON string of partial exits
    trailing_stop = db.Column(db.Boolean, default=False)
    breakeven_stop = db.Column(db.Boolean, default=False)
    
    # Lessons & Analysis
    lessons_learned = db.Column(db.Text, nullable=True)
    what_worked = db.Column(db.Text, nullable=True)
    what_didnt_work = db.Column(db.Text, nullable=True)
    next_time_improvements = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def profit_loss(self):
        """Calculate profit/loss based on trade type"""
        if self.trade_type.lower() == 'long':
            return (self.exit_price - self.entry_price) * self.size
        else:  # short
            return (self.entry_price - self.exit_price) * self.size
    
    @property
    def profit_loss_percentage(self):
        """Calculate profit/loss percentage"""
        if self.entry_price > 0:
            return (self.profit_loss / (self.entry_price * self.size)) * 100
        return 0
    
    @property
    def risk_reward_ratio(self):
        """Calculate risk/reward ratio"""
        if self.stop_loss and self.take_profit:
            if self.trade_type.lower() == 'long':
                risk = self.entry_price - self.stop_loss
                reward = self.take_profit - self.entry_price
            else:  # short
                risk = self.stop_loss - self.entry_price
                reward = self.entry_price - self.take_profit
            
            if risk > 0:
                return reward / risk
        return None
    
    @property
    def is_winning_trade(self):
        """Check if trade is profitable"""
        return self.profit_loss > 0
    
    @property
    def max_risk_amount(self):
        """Calculate maximum risk amount if stop loss was hit"""
        if self.stop_loss:
            if self.trade_type.lower() == 'long':
                return (self.entry_price - self.stop_loss) * self.size
            else:  # short
                return (self.stop_loss - self.entry_price) * self.size
        return 0
    
    @property
    def actual_risk_reward(self):
        """Calculate actual risk/reward based on exit price"""
        if self.stop_loss:
            actual_risk = self.max_risk_amount
            actual_reward = self.profit_loss
            if actual_risk > 0:
                return actual_reward / actual_risk
        return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'symbol': self.symbol,
            'trade_type': self.trade_type,
            'broker': self.broker,
            'entry_price': self.entry_price,
            'exit_price': self.exit_price,
            'size': self.size,
            'stop_loss': self.stop_loss,
            'take_profit': self.take_profit,
            'strategy': self.strategy,
            'notes': self.notes,
            'screenshot_path': self.screenshot_path,
            'position_size_percent': self.position_size_percent,
            'risk_per_trade': self.risk_per_trade,
            'risk_percent': self.risk_percent,
            'market_condition': self.market_condition,
            'volatility_index': self.volatility_index,
            'sector': self.sector,
            'market_sentiment': self.market_sentiment,
            'entry_reason': self.entry_reason,
            'exit_reason': self.exit_reason,
            'technical_indicators': self.technical_indicators,
            'chart_patterns': self.chart_patterns,
            'timeframe': self.timeframe,
            'volume_confirmation': self.volume_confirmation,
            'emotional_state': self.emotional_state,
            'confidence_level': self.confidence_level,
            'stress_level': self.stress_level,
            'setup_quality': self.setup_quality,
            'execution_quality': self.execution_quality,
            'holding_period': self.holding_period,
            'partial_exits': self.partial_exits,
            'trailing_stop': self.trailing_stop,
            'breakeven_stop': self.breakeven_stop,
            'lessons_learned': self.lessons_learned,
            'what_worked': self.what_worked,
            'what_didnt_work': self.what_didnt_work,
            'next_time_improvements': self.next_time_improvements,
            'profit_loss': self.profit_loss,
            'profit_loss_percentage': self.profit_loss_percentage,
            'risk_reward_ratio': self.risk_reward_ratio,
            'is_winning_trade': self.is_winning_trade,
            'max_risk_amount': self.max_risk_amount,
            'actual_risk_reward': self.actual_risk_reward,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 