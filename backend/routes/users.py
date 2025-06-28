from flask import Blueprint, request, jsonify, session
from models import UserPreference
from extensions import db
from functools import wraps

users_bp = Blueprint('users', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@users_bp.route('/preferences', methods=['GET'])
@login_required
def get_preferences():
    user_id = session['user_id']
    preferences = UserPreference.query.filter_by(user_id=user_id).first()
    if not preferences:
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
        return jsonify({'message': 'Preferences updated successfully', 'preferences': preferences.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update preferences'}), 500 