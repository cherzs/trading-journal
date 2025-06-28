from extensions import db
from datetime import datetime

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
            'profit_loss': self.profit_loss,
            'profit_loss_percentage': self.profit_loss_percentage,
            'risk_reward_ratio': self.risk_reward_ratio,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 