from flask import Blueprint, request, jsonify, session
from datetime import datetime
from models import Trade
from extensions import db
from functools import wraps

trades_bp = Blueprint('trades', __name__)

import os
import csv

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
    
    # Required fields
    required_fields = ['symbol', 'entry_price', 'exit_price', 'size', 'date', 'strategy']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Parse date
    try:
        trade_date = datetime.fromisoformat(data['date']).date()
    except:
        return jsonify({'error': 'Invalid date format'}), 400
    
    # Create trade with all possible fields
    trade = Trade(
        user_id=user_id,
        symbol=data['symbol'],
        trade_type=data.get('trade_type', 'long'),
        broker=data.get('broker'),
        entry_price=data['entry_price'],
        exit_price=data['exit_price'],
        size=data['size'],
        stop_loss=data.get('stop_loss'),
        take_profit=data.get('take_profit'),
        strategy=data['strategy'],
        notes=data.get('notes'),
        screenshot_path=data.get('screenshot_path'),
        
        # Risk Management
        position_size_percent=data.get('position_size_percent'),
        risk_per_trade=data.get('risk_per_trade'),
        risk_percent=data.get('risk_percent'),
        
        # Market Context
        market_condition=data.get('market_condition'),
        volatility_index=data.get('volatility_index'),
        sector=data.get('sector'),
        market_sentiment=data.get('market_sentiment'),
        
        # Technical Analysis
        entry_reason=data.get('entry_reason'),
        exit_reason=data.get('exit_reason'),
        technical_indicators=data.get('technical_indicators'),
        chart_patterns=data.get('chart_patterns'),
        timeframe=data.get('timeframe'),
        volume_confirmation=data.get('volume_confirmation'),
        
        # Emotional & Psychological Tracking
        emotional_state=data.get('emotional_state'),
        confidence_level=data.get('confidence_level'),
        stress_level=data.get('stress_level'),
        setup_quality=data.get('setup_quality'),
        execution_quality=data.get('execution_quality'),
        
        # Trade Management
        holding_period=data.get('holding_period'),
        partial_exits=data.get('partial_exits'),
        trailing_stop=data.get('trailing_stop', False),
        breakeven_stop=data.get('breakeven_stop', False),
        
        # Lessons & Analysis
        lessons_learned=data.get('lessons_learned'),
        what_worked=data.get('what_worked'),
        what_didnt_work=data.get('what_didnt_work'),
        next_time_improvements=data.get('next_time_improvements'),
        
        date=trade_date
    )
    
    try:
        db.session.add(trade)
        db.session.commit()
        return jsonify({'message': 'Trade created successfully', 'trade': trade.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create trade: {str(e)}'}), 500

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
    
    # Update basic fields
    if 'symbol' in data:
        trade.symbol = data['symbol']
    if 'trade_type' in data:
        trade.trade_type = data['trade_type']
    if 'broker' in data:
        trade.broker = data['broker']
    if 'entry_price' in data:
        trade.entry_price = data['entry_price']
    if 'exit_price' in data:
        trade.exit_price = data['exit_price']
    if 'size' in data:
        trade.size = data['size']
    if 'date' in data:
        try:
            trade.date = datetime.fromisoformat(data['date']).date()
        except:
            return jsonify({'error': 'Invalid date format'}), 400
    if 'stop_loss' in data:
        trade.stop_loss = data['stop_loss']
    if 'take_profit' in data:
        trade.take_profit = data['take_profit']
    if 'strategy' in data:
        trade.strategy = data['strategy']
    if 'notes' in data:
        trade.notes = data['notes']
    if 'screenshot_path' in data:
        trade.screenshot_path = data['screenshot_path']
    
    # Update risk management fields
    if 'position_size_percent' in data:
        trade.position_size_percent = data['position_size_percent']
    if 'risk_per_trade' in data:
        trade.risk_per_trade = data['risk_per_trade']
    if 'risk_percent' in data:
        trade.risk_percent = data['risk_percent']
    
    # Update market context fields
    if 'market_condition' in data:
        trade.market_condition = data['market_condition']
    if 'volatility_index' in data:
        trade.volatility_index = data['volatility_index']
    if 'sector' in data:
        trade.sector = data['sector']
    if 'market_sentiment' in data:
        trade.market_sentiment = data['market_sentiment']
    
    # Update technical analysis fields
    if 'entry_reason' in data:
        trade.entry_reason = data['entry_reason']
    if 'exit_reason' in data:
        trade.exit_reason = data['exit_reason']
    if 'technical_indicators' in data:
        trade.technical_indicators = data['technical_indicators']
    if 'chart_patterns' in data:
        trade.chart_patterns = data['chart_patterns']
    if 'timeframe' in data:
        trade.timeframe = data['timeframe']
    if 'volume_confirmation' in data:
        trade.volume_confirmation = data['volume_confirmation']
    
    # Update psychological fields
    if 'emotional_state' in data:
        trade.emotional_state = data['emotional_state']
    if 'confidence_level' in data:
        trade.confidence_level = data['confidence_level']
    if 'stress_level' in data:
        trade.stress_level = data['stress_level']
    if 'setup_quality' in data:
        trade.setup_quality = data['setup_quality']
    if 'execution_quality' in data:
        trade.execution_quality = data['execution_quality']
    
    # Update trade management fields
    if 'holding_period' in data:
        trade.holding_period = data['holding_period']
    if 'partial_exits' in data:
        trade.partial_exits = data['partial_exits']
    if 'trailing_stop' in data:
        trade.trailing_stop = data['trailing_stop']
    if 'breakeven_stop' in data:
        trade.breakeven_stop = data['breakeven_stop']
    
    # Update analysis fields
    if 'lessons_learned' in data:
        trade.lessons_learned = data['lessons_learned']
    if 'what_worked' in data:
        trade.what_worked = data['what_worked']
    if 'what_didnt_work' in data:
        trade.what_didnt_work = data['what_didnt_work']
    if 'next_time_improvements' in data:
        trade.next_time_improvements = data['next_time_improvements']
    
    try:
        db.session.commit()
        return jsonify({'message': 'Trade updated successfully', 'trade': trade.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update trade: {str(e)}'}), 500

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

@trades_bp.route('/seed', methods=['POST'])
@login_required
def import_demo_data():
    user_id = session['user_id']
    
    # Path to the CSV file
    # backend/routes/trades.py -> ... -> Project Root -> data/trades.csv
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    csv_path = os.path.join(base_dir, 'data', 'trades.csv')
    
    if not os.path.exists(csv_path):
        return jsonify({'error': f'Demo data file not found at {csv_path}'}), 404
        
    try:
        added_count = 0
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Handle date parsing
                    date_str = row.get('date', '')
                    if not date_str:
                        trade_date = datetime.now().date()
                    else:
                        try:
                            trade_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                        except ValueError:
                            trade_date = datetime.now().date()
                    
                    # Essential fields with defaults
                    trade = Trade(
                        user_id=user_id,
                        date=trade_date,
                        symbol=row.get('symbol', 'UNKNOWN'),
                        trade_type=row.get('trade_type', 'long'),
                        entry_price=float(row.get('entry_price', 0)),
                        exit_price=float(row.get('exit_price', 0)),
                        size=float(row.get('size', 0)),
                        strategy=row.get('strategy', 'Demo'),
                        notes=row.get('notes', 'Imported demo trade'),
                        
                        # Optional fields
                        stop_loss=float(row['stop_loss']) if row.get('stop_loss') else None,
                        take_profit=float(row['take_profit']) if row.get('take_profit') else None,
                        
                        # Map other fields if they exist in CSV
                        market_condition=row.get('market_condition'),
                        emotional_state=int(row['emotional_state']) if row.get('emotional_state') else None,
                        entry_reason=row.get('entry_reason'),
                        exit_reason=row.get('exit_reason')
                    )
                    
                    db.session.add(trade)
                    added_count += 1
                except Exception as row_error:
                    print(f"Error skipping row: {row_error}")
                    continue
                
        db.session.commit()
        return jsonify({'message': f'Successfully imported {added_count} demo trades'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to import demo data: {str(e)}'}), 500 