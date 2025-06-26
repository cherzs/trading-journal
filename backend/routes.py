from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from models import db, User, Trade, UserPreference
import re
from functools import wraps

# Create blueprints
auth_bp = Blueprint('auth', __name__)
trades_bp = Blueprint('trades', __name__)
users_bp = Blueprint('users', __name__)

# Session decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Authentication routes
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password strength
    if len(data['password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # Create session
        session['user_id'] = user.id
        session.permanent = True
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create session
    session['user_id'] = user.id
    session.permanent = True
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200

# Trade routes
@trades_bp.route('/', methods=['GET'])
@login_required
def get_trades():
    user_id = session['user_id']
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    trades = Trade.query.filter_by(user_id=user_id).order_by(Trade.entry_date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'trades': [trade.to_dict() for trade in trades.items],
        'total': trades.total,
        'pages': trades.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@trades_bp.route('/', methods=['POST'])
@login_required
def create_trade():
    user_id = session['user_id']
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['symbol', 'entry_price', 'exit_price', 'quantity', 'entry_date']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Create new trade
    trade = Trade(
        user_id=user_id,
        symbol=data['symbol'],
        entry_price=data['entry_price'],
        exit_price=data['exit_price'],
        quantity=data['quantity'],
        entry_date=datetime.fromisoformat(data['entry_date']),
        exit_date=datetime.fromisoformat(data['exit_date']) if data.get('exit_date') else None,
        trade_type=data.get('trade_type', 'long'),
        strategy=data.get('strategy', ''),
        notes=data.get('notes', ''),
        tags=data.get('tags', [])
    )
    
    try:
        db.session.add(trade)
        db.session.commit()
        
        return jsonify({
            'message': 'Trade created successfully',
            'trade': trade.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create trade'}), 500

@trades_bp.route('/<int:trade_id>', methods=['GET'])
@login_required
def get_trade(trade_id):
    user_id = session['user_id']
    trade = Trade.query.filter_by(id=trade_id, user_id=user_id).first()
    
    if not trade:
        return jsonify({'error': 'Trade not found'}), 404
    
    return jsonify({'trade': trade.to_dict()}), 200

@trades_bp.route('/<int:trade_id>', methods=['PUT'])
@login_required
def update_trade(trade_id):
    user_id = session['user_id']
    trade = Trade.query.filter_by(id=trade_id, user_id=user_id).first()
    
    if not trade:
        return jsonify({'error': 'Trade not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'symbol' in data:
        trade.symbol = data['symbol']
    if 'entry_price' in data:
        trade.entry_price = data['entry_price']
    if 'exit_price' in data:
        trade.exit_price = data['exit_price']
    if 'quantity' in data:
        trade.quantity = data['quantity']
    if 'entry_date' in data:
        trade.entry_date = datetime.fromisoformat(data['entry_date'])
    if 'exit_date' in data:
        trade.exit_date = datetime.fromisoformat(data['exit_date']) if data['exit_date'] else None
    if 'trade_type' in data:
        trade.trade_type = data['trade_type']
    if 'strategy' in data:
        trade.strategy = data['strategy']
    if 'notes' in data:
        trade.notes = data['notes']
    if 'tags' in data:
        trade.tags = data['tags']
    
    try:
        db.session.commit()
        
        return jsonify({
            'message': 'Trade updated successfully',
            'trade': trade.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update trade'}), 500

@trades_bp.route('/<int:trade_id>', methods=['DELETE'])
@login_required
def delete_trade(trade_id):
    user_id = session['user_id']
    trade = Trade.query.filter_by(id=trade_id, user_id=user_id).first()
    
    if not trade:
        return jsonify({'error': 'Trade not found'}), 404
    
    try:
        db.session.delete(trade)
        db.session.commit()
        
        return jsonify({'message': 'Trade deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete trade'}), 500

@trades_bp.route('/analytics', methods=['GET'])
@login_required
def get_analytics():
    user_id = session['user_id']
    
    # Get all trades for the user
    trades = Trade.query.filter_by(user_id=user_id).all()
    
    if not trades:
        return jsonify({
            'total_trades': 0,
            'winning_trades': 0,
            'losing_trades': 0,
            'win_rate': 0,
            'total_pnl': 0,
            'average_pnl': 0,
            'best_trade': None,
            'worst_trade': None
        }), 200
    
    # Calculate analytics
    total_trades = len(trades)
    winning_trades = sum(1 for trade in trades if trade.pnl > 0)
    losing_trades = sum(1 for trade in trades if trade.pnl < 0)
    win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
    
    total_pnl = sum(trade.pnl for trade in trades)
    average_pnl = total_pnl / total_trades if total_trades > 0 else 0
    
    best_trade = max(trades, key=lambda x: x.pnl) if trades else None
    worst_trade = min(trades, key=lambda x: x.pnl) if trades else None
    
    return jsonify({
        'total_trades': total_trades,
        'winning_trades': winning_trades,
        'losing_trades': losing_trades,
        'win_rate': round(win_rate, 2),
        'total_pnl': round(total_pnl, 2),
        'average_pnl': round(average_pnl, 2),
        'best_trade': best_trade.to_dict() if best_trade else None,
        'worst_trade': worst_trade.to_dict() if worst_trade else None
    }), 200

# User routes
@users_bp.route('/preferences', methods=['GET'])
@login_required
def get_preferences():
    user_id = session['user_id']
    preferences = UserPreference.query.filter_by(user_id=user_id).first()
    
    if not preferences:
        # Create default preferences
        preferences = UserPreference(user_id=user_id)
        db.session.add(preferences)
        db.session.commit()
    
    return jsonify({'preferences': preferences.to_dict()}), 200

@users_bp.route('/preferences', methods=['PUT'])
@login_required
def update_preferences():
    user_id = session['user_id']
    preferences = UserPreference.query.filter_by(user_id=user_id).first()
    
    if not preferences:
        preferences = UserPreference(user_id=user_id)
        db.session.add(preferences)
    
    data = request.get_json()
    
    # Update fields
    if 'default_currency' in data:
        preferences.default_currency = data['default_currency']
    if 'default_timeframe' in data:
        preferences.default_timeframe = data['default_timeframe']
    if 'dark_mode' in data:
        preferences.dark_mode = data['dark_mode']
    if 'notifications_enabled' in data:
        preferences.notifications_enabled = data['notifications_enabled']
    
    try:
        db.session.commit()
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'preferences': preferences.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update preferences'}), 500 