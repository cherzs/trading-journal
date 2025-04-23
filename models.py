"""
Model database untuk Trading Journal
"""
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    
    trades = db.relationship('Trade', backref='user', lazy=True, cascade="all, delete-orphan")
    preferences = db.relationship('UserPreference', backref='user', lazy=True, uselist=False, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Trade(db.Model):
    __tablename__ = 'trades'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    trade_type = db.Column(db.String(20), nullable=False)  # buy, sell
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
    
    def profit_loss(self):
        """Calculate profit/loss based on trade type"""
        if self.trade_type.lower() == 'buy':
            return (self.exit_price - self.entry_price) * self.size
        else:  # sell/short
            return (self.entry_price - self.exit_price) * self.size
    
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
            'profit_loss': self.profit_loss(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    @property
    def pnl(self):
        """Calculate profit/loss based on trade type"""
        if self.trade_type == 'long':
            return (self.exit_price - self.entry_price) * self.size
        else:  # short
            return (self.entry_price - self.exit_price) * self.size
    
    @property
    def entry_price_formatted(self):
        """Format entry price with appropriate decimal places"""
        if self.entry_price >= 1000:
            return f"${self.entry_price:.2f}"
        elif self.entry_price >= 1:
            return f"${self.entry_price:.2f}"
        else:
            return f"${self.entry_price:.5f}"
    
    @property
    def exit_price_formatted(self):
        """Format exit price with appropriate decimal places"""
        if self.exit_price >= 1000:
            return f"${self.exit_price:.2f}"
        elif self.exit_price >= 1:
            return f"${self.exit_price:.2f}"
        else:
            return f"${self.exit_price:.5f}"
    
    @property
    def pnl_formatted(self):
        """Format profit/loss with appropriate decimal places and currency symbol"""
        return f"${self.pnl:.2f}"

class UserPreference(db.Model):
    __tablename__ = 'user_preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    default_currency = db.Column(db.String(10), default='USD')
    default_timeframe = db.Column(db.String(20), default='Daily')
    dark_mode = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'default_currency': self.default_currency,
            'default_timeframe': self.default_timeframe,
            'dark_mode': self.dark_mode,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 