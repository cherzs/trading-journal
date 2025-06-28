from flask import Blueprint, request, jsonify, session
from models import User, UserPreference
from extensions import db
from functools import wraps
import re
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        session['user_id'] = user.id
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        session['user_id'] = user.id
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

@auth_bp.route('/change-password', methods=['PUT'])
@login_required
def change_password():
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current password and new password are required'}), 400
    
    current_password = data['current_password']
    new_password = data['new_password']
    
    # Verify current password
    if not user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Validate new password strength
    is_valid_password, password_message = validate_password(new_password)
    if not is_valid_password:
        return jsonify({'error': password_message}), 400
    
    # Update password
    user.set_password(new_password)
    
    try:
        db.session.commit()
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to change password'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update username if provided
    if 'username' in data:
        new_username = data['username'].strip()
        if new_username != user.username:
            # Check if username already exists
            if User.query.filter_by(username=new_username).first():
                return jsonify({'error': 'Username already exists'}), 409
            user.username = new_username
    
    # Update email if provided
    if 'email' in data:
        new_email = data['email'].strip().lower()
        if new_email != user.email:
            # Validate email format
            if not validate_email(new_email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Check if email already exists
            if User.query.filter_by(email=new_email).first():
                return jsonify({'error': 'Email already registered'}), 409
            user.email = new_email
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500

@auth_bp.route('/delete-account', methods=['DELETE'])
@login_required
def delete_account():
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('password'):
        return jsonify({'error': 'Password is required to delete account'}), 400
    
    # Verify password
    if not user.check_password(data['password']):
        return jsonify({'error': 'Password is incorrect'}), 401
    
    try:
        # Delete user (cascade will handle related data)
        db.session.delete(user)
        db.session.commit()
        
        # Clear session
        session.pop('user_id', None)
        
        return jsonify({'message': 'Account deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete account'}), 500

@auth_bp.route('/status', methods=['GET'])
def check_auth_status():
    """Check if user is authenticated without requiring login"""
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'authenticated': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }), 200
    
    return jsonify({
        'authenticated': False,
        'message': 'Not authenticated'
    }), 200 