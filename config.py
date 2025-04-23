"""
Configuration file for Flask application
"""
import os
from datetime import timedelta
import secrets
from dotenv import load_dotenv
import getpass

# Load environment variables
load_dotenv()

# Get current system username as default PostgreSQL user
DEFAULT_DB_USER = getpass.getuser()

class Config:
    """Base config class"""
    SECRET_KEY = os.environ.get('SECRET_KEY', secrets.token_hex(16))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    UPLOAD_FOLDER = 'static/uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # Upload settings
    DATA_FOLDER = 'data'
    
    # Google Auth settings
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
    GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"
    
    # Mail settings
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', MAIL_USERNAME)

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    # Correct connection string format for local PostgreSQL on Mac
    SQLALCHEMY_DATABASE_URI = 'postgresql:///trading_journal'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Replace postgres:// with postgresql:// for Heroku compatibility
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith('postgres://'):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgres://', 'postgresql://', 1)

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    # Correct connection string format for test database
    SQLALCHEMY_DATABASE_URI = 'postgresql:///trading_journal_test'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration class based on environment"""
    config_name = os.environ.get('FLASK_CONFIG', 'development')
    return config.get(config_name, config['default']) 