from flask import Blueprint, request, jsonify, session
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from functools import wraps
import uuid

uploads_bp = Blueprint('uploads', __name__)

# Configuration
UPLOAD_FOLDER = 'uploads/screenshots'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@uploads_bp.route('/screenshot', methods=['POST'])
@login_required
def upload_screenshot():
    """Upload a trade screenshot"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, WEBP'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large. Maximum size: 10MB'}), 400
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"screenshot_{session['user_id']}_{timestamp}_{unique_id}.{file_extension}"
        
        # Save file
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Return file path
        return jsonify({
            'message': 'Screenshot uploaded successfully',
            'filename': filename,
            'filepath': filepath,
            'size': file_size
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/screenshot/<filename>', methods=['GET'])
@login_required
def get_screenshot(filename):
    """Get a screenshot file"""
    try:
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        # Check if user owns this file (filename contains user_id)
        if f"screenshot_{session['user_id']}_" not in filename:
            return jsonify({'error': 'Access denied'}), 403
        
        # Return file
        from flask import send_file
        return send_file(filepath)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/screenshot/<filename>', methods=['DELETE'])
@login_required
def delete_screenshot(filename):
    """Delete a screenshot file"""
    try:
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        # Check if user owns this file
        if f"screenshot_{session['user_id']}_" not in filename:
            return jsonify({'error': 'Access denied'}), 403
        
        # Delete file
        os.remove(filepath)
        
        return jsonify({
            'message': 'Screenshot deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@uploads_bp.route('/screenshots', methods=['GET'])
@login_required
def list_screenshots():
    """List all screenshots for the user"""
    try:
        user_screenshots = []
        
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.startswith(f"screenshot_{session['user_id']}_"):
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file_stats = os.stat(filepath)
                
                user_screenshots.append({
                    'filename': filename,
                    'size': file_stats.st_size,
                    'created_at': datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
                    'url': f"/api/uploads/screenshot/{filename}"
                })
        
        # Sort by creation date (newest first)
        user_screenshots.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            'message': 'Screenshots retrieved successfully',
            'screenshots': user_screenshots
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 