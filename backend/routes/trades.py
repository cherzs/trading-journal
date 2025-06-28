from flask import Blueprint, request, jsonify, session
from datetime import datetime
from models import Trade
from extensions import db
from functools import wraps

trades_bp = Blueprint('trades', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@trades_bp.route('/', methods=['GET'])
@login_required
def get_trades():
    user_id = session['user_id']
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    trades = Trade.query.filter_by(user_id=user_id).order_by(Trade.date.desc()).paginate(
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
    required_fields = ['symbol', 'entry_price', 'exit_price', 'quantity', 'entry_date']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    trade = Trade(
        user_id=user_id,
        symbol=data['symbol'],
        entry_price=data['entry_price'],
        exit_price=data['exit_price'],
        quantity=data['quantity'],
        date=datetime.fromisoformat(data['entry_date']),
        trade_type=data.get('trade_type', 'long'),
        strategy=data.get('strategy', ''),
        notes=data.get('notes', ''),
        # tags=data.get('tags', [])
    )
    try:
        db.session.add(trade)
        db.session.commit()
        return jsonify({'message': 'Trade created successfully', 'trade': trade.to_dict()}), 201
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
    if 'symbol' in data:
        trade.symbol = data['symbol']
    if 'entry_price' in data:
        trade.entry_price = data['entry_price']
    if 'exit_price' in data:
        trade.exit_price = data['exit_price']
    if 'quantity' in data:
        trade.quantity = data['quantity']
    if 'date' in data:
        trade.date = datetime.fromisoformat(data['date'])
    if 'trade_type' in data:
        trade.trade_type = data['trade_type']
    if 'strategy' in data:
        trade.strategy = data['strategy']
    if 'notes' in data:
        trade.notes = data['notes']
    try:
        db.session.commit()
        return jsonify({'message': 'Trade updated successfully', 'trade': trade.to_dict()}), 200
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
    total_trades = len(trades)
    winning_trades = sum(1 for trade in trades if trade.profit_loss > 0)
    losing_trades = sum(1 for trade in trades if trade.profit_loss < 0)
    win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
    total_pnl = sum(trade.profit_loss for trade in trades)
    average_pnl = total_pnl / total_trades if total_trades > 0 else 0
    best_trade = max(trades, key=lambda x: x.profit_loss) if trades else None
    worst_trade = min(trades, key=lambda x: x.profit_loss) if trades else None
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