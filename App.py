from flask import Flask, render_template, redirect, url_for, request, flash, session, jsonify, send_file
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from flask_wtf.csrf import CSRFProtect
from wtforms import StringField, PasswordField, SubmitField, SelectField, FloatField, DateField, TextAreaField, FileField, BooleanField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional, NumberRange
import os
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
from datetime import datetime, timedelta
import json
import bcrypt
from pathlib import Path
import secrets
from werkzeug.utils import secure_filename
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
import base64
from dotenv import load_dotenv
from oauthlib.oauth2 import WebApplicationClient
import random
import string
from io import StringIO, BytesIO
import traceback

# Load environment variables
load_dotenv()

# Allow OAuth over HTTP for development
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Google OAuth client
client = WebApplicationClient(os.environ.get("GOOGLE_CLIENT_ID", ""))

# Create Flask app
app = Flask(__name__, 
            template_folder='templates',
            static_folder='static',
            static_url_path='/static')
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['DATA_FOLDER'] = 'data'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.permanent_session_lifetime = timedelta(days=7)

# Google OAuth Configuration
app.config['GOOGLE_CLIENT_ID'] = os.environ.get('GOOGLE_CLIENT_ID', '')
app.config['GOOGLE_CLIENT_SECRET'] = os.environ.get('GOOGLE_CLIENT_SECRET', '')
app.config['GOOGLE_DISCOVERY_URL'] = "https://accounts.google.com/.well-known/openid-configuration"

# Email Configuration
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', '')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])

# Initialize CSRF protection
csrf = CSRFProtect(app)

# Email verification token generator
ts = URLSafeTimedSerializer(app.config['SECRET_KEY'])

# Ensure directories exist
for folder in [app.config['UPLOAD_FOLDER'], app.config['DATA_FOLDER']]:
    Path(folder).mkdir(parents=True, exist_ok=True)

# Setup Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# User model
class User(UserMixin):
    def __init__(self, id, username, email, password_hash, is_verified=False, google_id=None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.is_verified = is_verified
        self.google_id = google_id

# User database (in-memory for demo)
users = {}
trades_db = {}  # Dictionary to store user trades

# Add demo user
demo_password = generate_password_hash('demo')
users['demo'] = User(
    id='demo',
    username='demo',
    email='demo@example.com',
    password_hash=demo_password,
    is_verified=True  # Demo user is verified by default
)
trades_db['demo'] = []

# Helper functions for email verification and Google authentication
def send_verification_email(user_email, token):
    """Send verification email to the user"""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Verify Your Tractional Account'
    msg['From'] = app.config['MAIL_DEFAULT_SENDER']
    msg['To'] = user_email
    
    verification_url = url_for('verify_email', token=token, _external=True)
    
    # Plain text version
    text = f"""
    Hello,
    
    Please verify your email address by clicking the link below:
    {verification_url}
    
    If you did not sign up for a Tractional account, please ignore this email.
    
    Thank you,
    The Tractional Team
    """
    
    # HTML version
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #8a5cf7, #5d34b0); padding: 20px; color: white; text-align: center; border-radius: 5px 5px 0 0; }}
            .content {{ padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #8a5cf7, #5d34b0); color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; font-size: 12px; color: #666; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Tractional</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Thank you for signing up for Tractional. Please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="{verification_url}" class="button">Verify Email Address</a>
                </p>
                <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
                <p>{verification_url}</p>
                <p>If you did not sign up for a Tractional account, please ignore this email.</p>
                <p>Thank you,<br>The Tractional Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2023 Tractional. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Attach both versions
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    msg.attach(part1)
    msg.attach(part2)
    
    try:
        server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
        server.ehlo()
        if app.config['MAIL_USE_TLS']:
            server.starttls()
        if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
            server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
        server.sendmail(app.config['MAIL_DEFAULT_SENDER'], user_email, msg.as_string())
        server.close()
        return True
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        return False

def generate_confirmation_token(email):
    """Generate confirmation token for email verification"""
    return ts.dumps(email, salt='email-confirm')

def confirm_token(token, expiration=3600):
    """Confirm token for email verification"""
    try:
        email = ts.loads(token, salt='email-confirm', max_age=expiration)
        return email
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

def get_google_provider_cfg():
    """Get Google OAuth provider configuration"""
    try:
        print("Attempting to get Google provider configuration...")
        
        # Check if Google client ID and secret are configured
        if not app.config['GOOGLE_CLIENT_ID'] or not app.config['GOOGLE_CLIENT_SECRET']:
            print("Google OAuth is not properly configured: Missing client ID or secret")
            return None
            
        # Make the request to get the provider configuration
        response = requests.get(app.config['GOOGLE_DISCOVERY_URL'], timeout=5)
        
        # Check the response status
        if response.status_code != 200:
            print(f"Failed to get Google provider configuration: Status code {response.status_code}")
            return None
            
        # Parse the JSON response
        config = response.json()
        
        # Verify that the required endpoints are present
        required_keys = ["authorization_endpoint", "token_endpoint", "userinfo_endpoint"]
        for key in required_keys:
            if key not in config:
                print(f"Google provider configuration missing required key: {key}")
                return None
                
        print("Successfully retrieved Google provider configuration")
        return config
    except requests.exceptions.RequestException as e:
        print(f"Network error when getting Google provider configuration: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing Google provider configuration: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error when getting Google provider configuration: {e}")
        return None

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return users.get(user_id)

# Forms
class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Login')

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

class TradeForm(FlaskForm):
    date = DateField('Date', validators=[DataRequired()])
    symbol = StringField('Symbol', validators=[DataRequired()])
    trade_type = SelectField('Type', choices=[('long', 'Long'), ('short', 'Short')], validators=[DataRequired()])
    entry_price = FloatField('Entry Price', validators=[DataRequired()])
    exit_price = FloatField('Exit Price', validators=[DataRequired()])
    size = FloatField('Position Size', validators=[DataRequired()])
    stop_loss = FloatField('Stop Loss', validators=[Optional()])
    take_profit = FloatField('Take Profit', validators=[Optional()])
    strategy = StringField('Strategy', validators=[DataRequired()])
    notes = TextAreaField('Notes', validators=[Optional()])
    screenshot = FileField('Screenshot', validators=[Optional()])
    submit = SubmitField('Add Trade')

# Helper functions
def get_user_trades(user_id):
    """Get trades for the current user"""
    if not os.path.exists(f"{app.config['DATA_FOLDER']}/trades.csv"):
        # If the file doesn't exist, return an empty dataframe with the expected columns
        return pd.DataFrame(columns=[
            "id", "date", "symbol", "entry_price", "exit_price", "size",
            "stop_loss", "take_profit", "pnl", "trade_type", 
            "strategy", "notes", "screenshot", "user_id"
        ])
    
    try:
        # Read all trades
        trades_df = pd.read_csv(f"{app.config['DATA_FOLDER']}/trades.csv")
        
        # Check if the CSV has user identification column
        user_column = "user_id"
        if "user_email" in trades_df.columns:
            user_column = "user_email"
        elif "user_id" not in trades_df.columns:
            # If no user column exists yet, return the in-memory trades
            return pd.DataFrame(trades_db.get(user_id, []))
        
        # Filter for current user
        if user_id in trades_df[user_column].values:
            user_trades = trades_df[trades_df[user_column] == user_id]
            return user_trades
        
        # If user has no trades in the CSV but has in-memory trades, use those
        if user_id in trades_db:
            return pd.DataFrame(trades_db[user_id])
        
        return pd.DataFrame()
    except Exception as e:
        print(f"Error reading trades: {e}")
        # Fallback to in-memory trades
        return pd.DataFrame(trades_db.get(user_id, []))

def calculate_rr_ratio(entry, sl, tp):
    if not entry or not sl or not tp:
        return 0
    
    # Calculate based on direction
    if tp > entry:  # Long position
        risk = abs(entry - sl)
        reward = abs(tp - entry)
    else:  # Short position
        risk = abs(entry - sl)
        reward = abs(entry - tp)
    
    if risk == 0:
        return 0
    return round(reward / risk, 2)

def calculate_profit_loss(entry, exit, position_size, is_long=True):
    if not entry or not exit or not position_size:
        return 0
    
    if is_long:
        return ((exit - entry) / entry) * 100
    else:
        return ((entry - exit) / entry) * 100

def calculate_risk_reward(entry, exit, stop):
    if stop is None or entry == stop:
        return None
    risk = abs(entry - stop)
    reward = abs(exit - entry)
    if risk == 0:
        return None
    return reward / risk

def calculate_pnl(entry_price, exit_price, size, trade_type):
    if trade_type == 'long':
        return (exit_price - entry_price) * size
    else:  # short
        return (entry_price - exit_price) * size

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login"""
    # Check if user is already logged in
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = LoginForm()
    
    # Check for error parameter and display as flash message
    error = request.args.get('error')
    if error:
        flash(error, 'danger')
    
    # Handle form submission
    if form.validate_on_submit():
        # Extract form data
        email = form.email.data
        password = form.password.data
        remember = form.remember_me.data
        
        # Check if user exists
        user_found = None
        for user in users.values():
            if user.email == email:
                user_found = user
                break
                
        if user_found:
            # Try to validate password using both methods for compatibility
            password_valid = False
            
            # Try the werkzeug password hash first
            try:
                if check_password_hash(user_found.password_hash, password):
                    password_valid = True
            except Exception as e:
                print(f"Werkzeug password check failed: {str(e)}")
            
            # If werkzeug check failed, try bcrypt
            if not password_valid:
                try:
                    import bcrypt
                    if bcrypt.checkpw(password.encode('utf-8'), user_found.password_hash.encode('utf-8')):
                        password_valid = True
                except Exception as e:
                    print(f"Bcrypt password check failed: {str(e)}")
            
            if password_valid:
                login_user(user_found, remember=remember)
                
                # Check if the user came from a specific page
                next_page = request.args.get('next')
                if not next_page or url_parse(next_page).netloc != '':
                    next_page = url_for('dashboard')
                    
                return redirect(next_page)
            else:
                flash("Invalid email or password", "danger")
        else:
            # User not found
            flash("Invalid email or password", "danger")
            
    # For demo login
    if 'demo_login' in request.args:
        # Check if demo user exists
        demo_email = "demo@example.com"
        demo_user = None
        
        for user in users.values():
            if user.email == demo_email:
                demo_user = user
                break
                
        if demo_user:
            login_user(demo_user)
            return redirect(url_for('dashboard'))
        else:
            # Create demo user if it doesn't exist
            user_id = str(uuid.uuid4())
            password_hash = generate_password_hash("demo")
            
            new_user = User(
                id=user_id,
                username="Demo User",
                email=demo_email,
                password_hash=password_hash,
                is_verified=True
            )
            
            users[user_id] = new_user
            trades_db[user_id] = []
            
            # Optional: Add sample trades for the demo user
            
            # Log in demo user
            login_user(new_user)
            return redirect(url_for('dashboard'))
    
    # Render the login template
    return render_template('login.html', form=form, google_client_id=app.config['GOOGLE_CLIENT_ID'])

@app.route('/login/google')
def google_login():
    """Generate and redirect to Google OAuth URL"""
    try:
        print("Attempting Google login...")
        
        # Find out what URL to hit for Google login
        google_provider_cfg = get_google_provider_cfg()
        if not google_provider_cfg:
            print("Failed to get Google provider configuration")
            flash("Error connecting to Google. Please try again.", "danger")
            return redirect(url_for("login"))
        
        # Get the authorization endpoint
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]
        
        # Make sure GOOGLE_CLIENT_ID is set
        if not app.config["GOOGLE_CLIENT_ID"]:
            print("GOOGLE_CLIENT_ID is not configured")
            flash("Google login is not properly configured.", "danger")
            return redirect(url_for("login"))
            
        # Create the redirect URL - IMPORTANT: use _external=True for proper URL resolution
        redirect_uri = url_for("google_callback", _external=True)
        print(f"Using redirect URL: {redirect_uri}")
        
        # Use the library to construct the request for Google login
        request_uri = client.prepare_request_uri(
            authorization_endpoint,
            redirect_uri=redirect_uri,
            scope=["openid", "email", "profile"],
        )
        
        print(f"Redirecting to Google authorization URL: {request_uri}")
        
        # Redirect to Google's OAuth page
        return redirect(request_uri)
    except Exception as e:
        print(f"Error during Google login: {e}")
        flash("An error occurred during Google login. Please try again.", "danger")
        return redirect(url_for("login"))

@app.route('/login/google/callback')
def google_callback():
    """Callback route for Google OAuth login"""
    try:
        # Get authorization code Google sent back to you
        code = request.args.get("code")
        print(f"Received authorization code: {code[:10]}...")
        
        # Find out what URL to hit to get tokens that allow you to ask for
        # things on behalf of a user
        try:
            print("Attempting to get Google provider configuration...")
            google_provider_cfg = get_google_provider_cfg()
            print("Successfully retrieved Google provider configuration")
            token_endpoint = google_provider_cfg["token_endpoint"]
            print(f"Token endpoint: {token_endpoint}")
        except Exception as e:
            print(f"Error retrieving Google provider configuration: {str(e)}")
            return redirect(url_for("login", error="Failed to get Google provider configuration"))
            
        print(f"GOOGLE_CLIENT_ID exists: {bool(app.config['GOOGLE_CLIENT_ID'])}")
        print(f"GOOGLE_CLIENT_SECRET exists: {bool(app.config['GOOGLE_CLIENT_SECRET'])}")
        
        # Construct callback URL for the token request
        redirect_uri = url_for('google_callback', _external=True)
        print(f"Using callback URL: {redirect_uri}")
        
        try:
            # Prepare token request
            token_url, headers, body = client.prepare_token_request(
                token_endpoint,
                authorization_response=request.url,
                redirect_url=redirect_uri,
                code=code
            )
            print("Successfully prepared token request")
            
            # Get tokens and create a session
            token_response = requests.post(
                token_url,
                headers=headers,
                data=body,
                auth=(app.config["GOOGLE_CLIENT_ID"], app.config["GOOGLE_CLIENT_SECRET"]),
            )
            
            # Parse tokens
            client.parse_request_body_response(json.dumps(token_response.json()))
            print("Successfully parsed token response")
        except Exception as e:
            print(f"Error during token exchange: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return redirect(url_for("login", error="Failed to exchange token with Google"))
        
        try:
            # Get user info from Google
            userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
            uri, headers, body = client.add_token(userinfo_endpoint)
            userinfo_response = requests.get(uri, headers=headers, data=body)
            print(f"Userinfo response status: {userinfo_response.status_code}")
            
            # Check if user is verified
            if not userinfo_response.json().get("email_verified"):
                return redirect(url_for("login", error="Email not verified with Google"))
                
            # Get user data
            users_email = userinfo_response.json()["email"]
            users_name = userinfo_response.json().get("name", users_email.split('@')[0])
            google_id = userinfo_response.json()["sub"]
            print(f"Retrieved Google info - Email: {users_email}, Name: {users_name}")
        except Exception as e:
            print(f"Error retrieving Google user info: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return redirect(url_for("login", error="Failed to get user info from Google"))
        
        # Check if user exists
        try:
            print(f"Searching for existing user with email: {users_email}")
            existing_user = None
            for user_id, user in users.items():
                if user.email == users_email:
                    existing_user = user
                    print(f"Found existing user: {user.username} (ID: {user.id})")
                    break
                    
            if existing_user:
                # Log in existing user
                print(f"Logging in existing user: {existing_user.username}")
                login_user(existing_user)
                print("User logged in successfully")
                return redirect(url_for("dashboard"))
                
            # Create a new user
            user_id = str(uuid.uuid4())
            print(f"Creating new user with ID: {user_id}")
            
            # Generate random password for the new user since they're logging in with Google
            password = secrets.token_urlsafe(16)
            password_hash = generate_password_hash(password)
            print("Generated and hashed random password")
            
            # Create the user
            new_user = User(
                id=user_id,
                username=users_name,
                email=users_email,
                password_hash=password_hash,
                is_verified=True,  # Google has already verified their email
                google_id=google_id
            )
            
            # Store the user
            users[user_id] = new_user
            
            # Initialize trades list for the new user
            trades_db[user_id] = []
            
            # Save users data
            save_users()
            print(f"Created and saved new user: {users_name} (ID: {user_id})")
            
            # Log in the user
            login_user(new_user)
            print("User logged in successfully")
            
            return redirect(url_for("dashboard"))
        except Exception as e:
            print(f"Error creating or logging in user: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return redirect(url_for("login", error="Error creating account"))
    except Exception as e:
        print(f"Unexpected error during Google callback: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return redirect(url_for("login", error="Authentication failed"))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    
    form = RegisterForm()
    
    # Get Google OAuth authorization URL
    google_auth_url = None
    google_client_id = app.config['GOOGLE_CLIENT_ID']
    if app.config['GOOGLE_CLIENT_ID'] and app.config['GOOGLE_CLIENT_SECRET']:
        try:
            # Get authorization endpoint from Google discovery URL
            google_provider_cfg = get_google_provider_cfg()
            if google_provider_cfg:
                authorization_endpoint = google_provider_cfg["authorization_endpoint"]
                
                # Generate authorization URL
                google_auth_url = client.prepare_request_uri(
                    authorization_endpoint,
                    redirect_uri=url_for('google_callback', _external=True),
                    scope=["openid", "email", "profile"]
                )
        except Exception as e:
            print(f"Error creating Google Auth URL: {e}")
    
    if form.validate_on_submit():
        for user in users.values():
            if user.email == form.email.data:
                flash('Email already registered')
                return render_template('register.html', form=form, google_auth_url=google_auth_url, google_client_id=google_client_id)
            if user.username == form.username.data:
                flash('Username already taken')
                return render_template('register.html', form=form, google_auth_url=google_auth_url, google_client_id=google_client_id)
        
        user_id = str(uuid.uuid4())
        
        # Create user (not verified yet)
        users[user_id] = User(
            id=user_id,
            username=form.username.data,
            email=form.email.data,
            password_hash=generate_password_hash(form.password.data),
            is_verified=False
        )
        trades_db[user_id] = []
        
        # Generate and send verification token
        token = generate_confirmation_token(form.email.data)
        
        if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
            # Send verification email
            if send_verification_email(form.email.data, token):
                flash('Registration successful! Please check your email to verify your account.')
            else:
                flash('Registration successful, but failed to send verification email. Please contact support.')
        else:
            # For development without email setup, auto-verify the account
            users[user_id].is_verified = True
            flash('Registration successful! Your account is verified (email verification skipped in development mode).')
        
        return redirect(url_for('login'))
    
    return render_template('register.html', form=form, google_auth_url=google_auth_url, google_client_id=google_client_id)

@app.route('/verify_email/<token>')
def verify_email(token):
    """Verify email address using token"""
    email = confirm_token(token)
    
    if not email:
        flash('The verification link is invalid or has expired.', 'danger')
        return redirect(url_for('login'))
    
    for user_id, user in users.items():
        if user.email == email:
            user.is_verified = True
            flash('Your email has been verified. You can now log in.', 'success')
            return redirect(url_for('login'))
    
    flash('User not found.', 'danger')
    return redirect(url_for('login'))

@app.route('/resend-verification')
def resend_verification():
    """Resend verification email"""
    email = request.args.get('email')
    if not email:
        flash('Email address is required.')
        return redirect(url_for('login'))
    
    user_to_verify = None
    for user in users.values():
        if user.email == email:
            user_to_verify = user
            break
    
    if not user_to_verify:
        flash('User not found.')
        return redirect(url_for('login'))
    
    if user_to_verify.is_verified:
        flash('Account already verified. Please login.')
        return redirect(url_for('login'))
    
    # Generate and send verification token
    token = generate_confirmation_token(email)
    
    if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
        if send_verification_email(email, token):
            flash('Verification email has been resent.')
        else:
            flash('Failed to send verification email. Please try again later.')
    else:
        # For development, auto-verify
        user_to_verify.is_verified = True
        flash('Your account has been verified (email verification skipped in development mode).')
    
    return redirect(url_for('login'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Get user trades
    trades_df = get_user_trades(current_user.id)
    
    # Convert DataFrame to list of dicts for easier template processing
    trades = []
    if not trades_df.empty:
        trades = trades_df.to_dict(orient='records')
    
    # Calculate statistics
    total_trades = len(trades)
    winning_trades = sum(1 for trade in trades if trade.get('pnl', 0) > 0)
    win_rate = round((winning_trades / total_trades * 100) if total_trades > 0 else 0, 2)
    
    # Calculate profit factor
    gross_profit = sum(trade.get('pnl', 0) for trade in trades if trade.get('pnl', 0) > 0)
    gross_loss = abs(sum(trade.get('pnl', 0) for trade in trades if trade.get('pnl', 0) < 0))
    profit_factor = round((gross_profit / gross_loss) if gross_loss > 0 else gross_profit, 2)
    
    # Calculate total P&L
    total_pnl = sum(trade.get('pnl', 0) for trade in trades)
    total_pnl_formatted = f"${total_pnl:.2f}"
    
    # Format trades for display
    for trade in trades:
        # Format date
        if 'date' in trade and trade['date']:
            try:
                trade_date = pd.to_datetime(trade['date'])
                trade['date'] = trade_date.strftime('%b %d, %Y')
            except:
                pass
        
        # Format P&L
        if 'pnl' in trade:
            trade['pnl_formatted'] = f"${trade['pnl']:.2f}"
    
    # Sort trades by date (newest first) for recent trades
    sorted_trades = sorted(trades, key=lambda x: pd.to_datetime(x.get('date', '1970-01-01'), errors='coerce'), reverse=True)
    recent_trades = sorted_trades[:5]  # Get 5 most recent trades
    
    # Get current date for display
    current_date = datetime.now().strftime("%B %d, %Y")
    
    # Calculate weekly changes (placeholder values for demonstration)
    total_trades_change = 2  # Example: 2 more trades than last week
    win_rate_change = 5.5    # Example: 5.5% increase in win rate
    profit_factor_change = 0.3  # Example: 0.3 increase in profit factor
    pnl_change = 120.50     # Example: $120.50 increase in P&L
    
    # Prepare chart data (placeholder data for demonstration)
    daily_pnl = {}
    for trade in trades:
        try:
            date = pd.to_datetime(trade.get('date')).strftime('%Y-%m-%d')
            daily_pnl[date] = daily_pnl.get(date, 0) + trade.get('pnl', 0)
        except:
            continue
    
    # Convert to arrays for Chart.js
    labels = list(daily_pnl.keys())
    values = list(daily_pnl.values())
    
    # Chart data JSON
    chart_data = {
        'labels': labels,
        'values': values
    }
    
    # Strategy performance data
    strategy_performance = {}
    for trade in trades:
        strategy = trade.get('strategy', 'Unknown')
        if strategy not in strategy_performance:
            strategy_performance[strategy] = {'count': 0, 'pnl': 0, 'wins': 0}
        
        strategy_performance[strategy]['count'] += 1
        strategy_performance[strategy]['pnl'] += trade.get('pnl', 0)
        if trade.get('pnl', 0) > 0:
            strategy_performance[strategy]['wins'] += 1
    
    # Calculate win rates and format for chart
    strategy_data = {
        'labels': list(strategy_performance.keys()),
        'win_rates': [round(s['wins'] / s['count'] * 100, 1) if s['count'] > 0 else 0 for s in strategy_performance.values()],
        'pnls': [round(s['pnl'], 2) for s in strategy_performance.values()]
    }
    
    # Symbol performance data
    symbol_performance = {}
    for trade in trades:
        symbol = trade.get('symbol', 'Unknown')
        if symbol not in symbol_performance:
            symbol_performance[symbol] = {'count': 0, 'pnl': 0}
        
        symbol_performance[symbol]['count'] += 1
        symbol_performance[symbol]['pnl'] += trade.get('pnl', 0)
    
    # Format for chart
    symbol_data = {
        'labels': list(symbol_performance.keys()),
        'counts': [s['count'] for s in symbol_performance.values()],
        'pnls': [round(s['pnl'], 2) for s in symbol_performance.values()]
    }
    
    # User info for display
    user = {
        'name': current_user.username if hasattr(current_user, 'username') else 'Trader'
    }
    
    # If no trades, use default values
    if total_trades == 0:
        return render_template('dashboard.html', 
                               trades=[],
                               total_trades=0,
                               win_rate=0,
                               profit_factor=0,
                               total_pnl=0,
                               total_pnl_formatted="$0.00",
                               recent_trades=[],
                               total_trades_change=0,
                               win_rate_change=0,
                               profit_factor_change=0,
                               pnl_change=0,
                               current_date=current_date,
                               chart_data={"labels": [], "values": []},
                               strategy_data={"labels": [], "win_rates": [], "pnls": []},
                               symbol_data={"labels": [], "counts": [], "pnls": []},
                               user=user,
                               google_client_id=app.config['GOOGLE_CLIENT_ID'])
    
    return render_template('dashboard.html', 
                           trades=trades,
                           total_trades=total_trades,
                           win_rate=win_rate,
                           profit_factor=profit_factor,
                           total_pnl=total_pnl,
                           total_pnl_formatted=total_pnl_formatted,
                           recent_trades=recent_trades,
                           total_trades_change=total_trades_change,
                           win_rate_change=win_rate_change,
                           profit_factor_change=profit_factor_change,
                           pnl_change=pnl_change,
                           current_date=current_date,
                           chart_data=chart_data,
                           strategy_data=strategy_data,
                           symbol_data=symbol_data,
                           user=user,
                           google_client_id=app.config['GOOGLE_CLIENT_ID'])

@app.route('/add_trade', methods=['GET', 'POST'])
@login_required
def add_trade():
    form = TradeForm()
    if form.validate_on_submit():
        trade_id = str(uuid.uuid4())
        trade_data = {
            'id': trade_id,
            'date': form.date.data.strftime('%Y-%m-%d'),
            'symbol': form.symbol.data.upper(),
            'trade_type': form.trade_type.data,
            'entry_price': form.entry_price.data,
            'exit_price': form.exit_price.data,
            'size': form.size.data,
            'stop_loss': form.stop_loss.data,
            'take_profit': form.take_profit.data,
            'strategy': form.strategy.data,
            'notes': form.notes.data,
            'screenshot': None,
            'user_id': current_user.id
        }
        
        # Calculate P&L
        trade_data['pnl'] = calculate_pnl(
            trade_data['entry_price'], 
            trade_data['exit_price'], 
            trade_data['size'], 
            trade_data['trade_type']
        )
        
        # Calculate risk/reward ratio if stop loss is provided
        if form.stop_loss.data:
            trade_data['risk_reward'] = calculate_risk_reward(
                trade_data['entry_price'],
                trade_data['exit_price'],
                trade_data['stop_loss']
            )
        
        # Handle screenshot upload
        if form.screenshot.data:
            filename = secure_filename(f"{current_user.id}_{trade_id}_{form.screenshot.data.filename}")
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            form.screenshot.data.save(file_path)
            trade_data['screenshot'] = filename
        
        # Save the trade to in-memory database
        if current_user.id not in trades_db:
            trades_db[current_user.id] = []
        trades_db[current_user.id].append(trade_data)
        
        # Save to CSV
        try:
            # Convert to dataframe
            trade_df = pd.DataFrame([trade_data])
            
            if os.path.exists(f"{app.config['DATA_FOLDER']}/trades.csv"):
                # Append to existing file
                existing_trades = pd.read_csv(f"{app.config['DATA_FOLDER']}/trades.csv")
                updated_trades = pd.concat([existing_trades, trade_df], ignore_index=True)
                updated_trades.to_csv(f"{app.config['DATA_FOLDER']}/trades.csv", index=False)
            else:
                # Create new file
                trade_df.to_csv(f"{app.config['DATA_FOLDER']}/trades.csv", index=False)
        except Exception as e:
            print(f"Error saving trade to CSV: {e}")
            # Continue as we still have it saved in memory
        
        flash('Trade added successfully!')
        return redirect(url_for('dashboard'))
    
    return render_template('add_trade.html', form=form, google_client_id=app.config['GOOGLE_CLIENT_ID'])

@app.route('/trades')
@login_required
def trades():
    # Get user trades
    trades_df = get_user_trades(current_user.id)
    
    # Convert DataFrame to list of dicts for easier template processing
    trades = []
    if not trades_df.empty:
        trades = trades_df.to_dict(orient='records')
    
    # Format trades for display
    for trade in trades:
        # Format prices
        if 'entry_price' in trade:
            trade['entry_price_formatted'] = f"${trade['entry_price']:.2f}"
        if 'exit_price' in trade:
            trade['exit_price_formatted'] = f"${trade['exit_price']:.2f}"
        # Format P&L
        if 'pnl' in trade:
            pnl = trade['pnl']
            trade['pnl_formatted'] = f"${pnl:.2f}" if pnl >= 0 else f"-${abs(pnl):.2f}"
    
    # Get unique symbols and strategies for filters
    symbols = set(trade.get('symbol', '') for trade in trades if 'symbol' in trade)
    strategies = set(trade.get('strategy', '') for trade in trades if 'strategy' in trade)
    
    # Simple pagination
    page = request.args.get('page', 1, type=int)
    per_page = 10
    total_trades = len(trades)
    total_pages = (total_trades + per_page - 1) // per_page  # Ceiling division
    
    # Slice trades for current page
    start_idx = (page - 1) * per_page
    end_idx = min(start_idx + per_page, total_trades)
    page_trades = trades[start_idx:end_idx]
    
    return render_template('trades.html', 
                          trades=page_trades,
                          symbols=sorted(symbols),
                          strategies=sorted(strategies),
                          page=page,
                          total_pages=max(1, total_pages),  # At least 1 page
                          total_trades=total_trades,
                          page_start=start_idx + 1 if total_trades > 0 else 0,
                          page_end=end_idx,
                          has_prev=page > 1,
                          has_next=page < total_pages,
                          google_client_id=app.config['GOOGLE_CLIENT_ID'])

@app.route('/trade/<trade_id>')
@login_required
def view_trade(trade_id):
    # Get user trades
    trades_df = get_user_trades(current_user.id)
    
    # Convert DataFrame to list of dicts
    trades = []
    if not trades_df.empty:
        trades = trades_df.to_dict(orient='records')
    
    # Find the specific trade
    trade = next((t for t in trades if t.get('id') == trade_id), None)
    
    if not trade:
        flash('Trade not found')
        return redirect(url_for('trades'))
    
    # Format prices and P&L for display
    if 'entry_price' in trade:
        trade['entry_price_formatted'] = f"${trade['entry_price']:.2f}"
    if 'exit_price' in trade:
        trade['exit_price_formatted'] = f"${trade['exit_price']:.2f}"
    if 'pnl' in trade:
        pnl = trade['pnl']
        trade['pnl_formatted'] = f"${pnl:.2f}" if pnl >= 0 else f"-${abs(pnl):.2f}"
    
    return render_template('trade_detail.html', trade=trade, google_client_id=app.config['GOOGLE_CLIENT_ID'])

@app.route('/delete_trade/<trade_id>', methods=['POST'])
@login_required
def delete_trade(trade_id):
    # Check in-memory trades
    if current_user.id in trades_db:
        in_memory_trades = trades_db[current_user.id]
        
        for i, trade in enumerate(in_memory_trades):
            if trade['id'] == trade_id:
                # Delete any associated screenshot
                if trade.get('screenshot'):
                    try:
                        screenshot_path = os.path.join(app.config['UPLOAD_FOLDER'], trade['screenshot'])
                        if os.path.exists(screenshot_path):
                            os.remove(screenshot_path)
                    except Exception as e:
                        print(f"Error deleting screenshot: {e}")
                
                # Remove the trade
                removed_trade = in_memory_trades.pop(i)
                
                # Update CSV file if it exists
                csv_path = f"{app.config['DATA_FOLDER']}/trades.csv"
                if os.path.exists(csv_path):
                    try:
                        trades_df = pd.read_csv(csv_path)
                        # Check if ID column exists
                        if 'id' in trades_df.columns:
                            # Remove the trade with matching ID
                            trades_df = trades_df[trades_df['id'] != trade_id]
                            trades_df.to_csv(csv_path, index=False)
                    except Exception as e:
                        print(f"Error updating CSV after delete: {e}")
                
                flash('Trade deleted successfully')
                break
    
    return redirect(url_for('trades'))

@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    # Get the current user
    user = current_user
    
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'delete_account':
            # Delete all user data
            user_id = user.id
            if user_id in trades_db:
                del trades_db[user_id]
            if user_id in users:
                del users[user_id]
                
            # Delete user from users.csv
            save_users()
            
            # Log out user
            logout_user()
            flash('Your account has been deleted successfully.', 'success')
            return redirect(url_for('index'))
        
        # Process password update
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        
        if current_password and new_password:
            # Try Werkzeug format first (for migrated passwords)
            if check_password_hash(user.password_hash, current_password):
                user.password_hash = generate_password_hash(new_password)
                save_users()
                flash('Your password has been updated successfully!', 'success')
            # Try bcrypt format as fallback
            elif bcrypt.checkpw(current_password.encode('utf-8'), user.password_hash.encode('utf-8')):
                user.password_hash = generate_password_hash(new_password)
                save_users()
                flash('Your password has been updated successfully!', 'success')
            else:
                flash('Current password is incorrect.', 'danger')
        
        # Process app preferences (dark mode toggle could go here)
        # This would typically involve saving user preferences to the user object
        
        # Stay on settings page
        return redirect(url_for('settings'))
    
    return render_template('settings.html', 
                           user=user, 
                           google_client_id=app.config['GOOGLE_CLIENT_ID'])

@app.route('/upgrade_premium', methods=['POST'])
@login_required
def upgrade_premium():
    # In a real application, this would connect to a payment processor
    # For now, we'll just show a message
    flash('Premium upgrade feature is coming soon!', 'info')
    return redirect(url_for('settings'))

@app.route('/export_trades', methods=['POST'])
@login_required
def export_trades():
    user_id = current_user.id
    if user_id not in trades_db:
        flash('No trades found to export.', 'warning')
        return redirect(url_for('settings'))
    
    # Create CSV in memory
    trades_df = pd.DataFrame(trades_db[user_id])
    
    # If no trades, return early
    if trades_df.empty:
        flash('No trades found to export.', 'warning')
        return redirect(url_for('settings'))
    
    # Export to CSV
    csv_data = StringIO()
    trades_df.to_csv(csv_data, index=False)
    csv_data.seek(0)
    
    # Return CSV as downloadable file
    return send_file(
        BytesIO(csv_data.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'trades_{user_id}_{datetime.now().strftime("%Y%m%d")}.csv'
    )

@app.route('/import_trades', methods=['POST'])
@login_required
def import_trades():
    user_id = current_user.id
    
    if 'file' not in request.files:
        flash('No file part', 'danger')
        return redirect(url_for('settings'))
    
    file = request.files['file']
    if file.filename == '':
        flash('No selected file', 'danger')
        return redirect(url_for('settings'))
    
    if file and file.filename.endswith('.csv'):
        try:
            # Read CSV
            trades_df = pd.read_csv(file)
            
            # Validate required columns
            required_columns = ['symbol', 'entry_date', 'exit_date', 'entry_price', 
                                'exit_price', 'position_size', 'pnl', 'strategy', 'notes']
            
            missing_columns = [col for col in required_columns if col not in trades_df.columns]
            if missing_columns:
                flash(f'Missing required columns: {", ".join(missing_columns)}', 'danger')
                return redirect(url_for('settings'))
            
            # Add user_id column if not present
            if 'user_id' not in trades_df.columns:
                trades_df['user_id'] = user_id
            
            # Add trade_id if not present
            if 'trade_id' not in trades_df.columns:
                # Generate unique trade IDs
                trades_df['trade_id'] = [str(uuid.uuid4()) for _ in range(len(trades_df))]
            
            # Convert to list of dicts
            trades_list = trades_df.to_dict('records')
            
            # Initialize trades_db[user_id] if not exists
            if user_id not in trades_db:
                trades_db[user_id] = []
            
            # Add trades to in-memory DB
            trades_db[user_id].extend(trades_list)
            
            # Save to CSV
            save_trades_to_csv()
            
            flash(f'Successfully imported {len(trades_list)} trades!', 'success')
        except Exception as e:
            flash(f'Error importing trades: {str(e)}', 'danger')
    else:
        flash('Only CSV files are allowed', 'danger')
    
    return redirect(url_for('settings'))

@app.route('/delete_all_trades', methods=['POST'])
@login_required
def delete_all_trades():
    user_id = current_user.id
    
    # Clear trades for this user
    if user_id in trades_db:
        trades_db[user_id] = []
        
    # Save empty trade list to CSV
    save_trades_to_csv()
    
    flash('All trades have been deleted.', 'success')
    return redirect(url_for('settings'))

# Fungsi untuk menyimpan pengguna ke CSV
def save_users():
    users_data = []
    for user_id, user in users.items():
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'password_hash': user.password_hash,
            'is_verified': user.is_verified,
            'google_id': getattr(user, 'google_id', None)
        })
    
    users_df = pd.DataFrame(users_data)
    users_df.to_csv('users.csv', index=False)
    
# Fungsi untuk menyimpan perdagangan ke CSV
def save_trades_to_csv():
    all_trades = []
    for user_id, user_trades in trades_db.items():
        for trade in user_trades:
            # Ensure user_id is attached to each trade
            trade_copy = trade.copy()
            trade_copy['user_id'] = user_id
            all_trades.append(trade_copy)
    
    if all_trades:
        trades_df = pd.DataFrame(all_trades)
        trades_df.to_csv('trades.csv', index=False)
    else:
        # Create empty CSV with headers
        pd.DataFrame(columns=['trade_id', 'symbol', 'entry_date', 'exit_date', 
                             'entry_price', 'exit_price', 'position_size', 
                             'pnl', 'strategy', 'notes', 'user_id']).to_csv('trades.csv', index=False)

# New route for Google Sign-In token handling
@app.route('/login/google/token', methods=['POST'])
def login_google_token():
    """Handle Google Sign-In token from client-side authentication"""
    print("\n===== GOOGLE TOKEN LOGIN DEBUG =====")
    
    # Get token from request
    token = request.form.get('id_token')
    if not token:
        print("No token provided in request")
        return jsonify({'error': 'No token provided'}), 400
    
    print(f"Received token of length: {len(token)}")
    
    try:
        # Verify token
        print("Verifying token...")
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                app.config['GOOGLE_CLIENT_ID']
            )
            print("Token successfully verified")
            print(f"Token info contains keys: {list(idinfo.keys())}")
        except ValueError as ve:
            print(f"Invalid token: {str(ve)}")
            return jsonify({'error': f'Invalid token: {str(ve)}'}), 401
        
        # Check if the token is valid
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            print(f"Invalid token issuer: {idinfo['iss']}")
            return jsonify({'error': 'Invalid token issuer'}), 401
        
        # Get user info
        google_id = idinfo['sub']
        email = idinfo['email']
        email_verified = idinfo.get('email_verified', False)
        name = idinfo.get('name', email.split('@')[0])
        
        print(f"Google user info: id={google_id}, email={email}, verified={email_verified}, name={name}")
        
        if not email_verified:
            print("Email not verified with Google")
            return jsonify({'error': 'Email not verified with Google. Please verify your email first.'}), 401
        
        # Check if user exists
        user_found = None
        for user_id, user in users.items():
            if user.email == email:
                user_found = user
                print(f"Found existing user with email {email}, id={user_id}")
                break
                
        if not user_found:
            print(f"Creating new user for {email}")
            # Generate a random secure password for the user
            import uuid
            import secrets
            random_password = secrets.token_urlsafe(16)
            hashed_password = generate_password_hash(random_password)
            
            # Create the user
            user_id = str(uuid.uuid4())
            new_user = User(
                id=user_id,
                username=name,  # Use the name as username
                email=email,
                password_hash=hashed_password,
                is_verified=True,  # User is verified via Google
                google_id=google_id  # Store the Google ID
            )
            users[user_id] = new_user
            # Initialize empty trades list for the new user
            trades_db[user_id] = []
            user_found = new_user
            print(f"Created new user with ID {user_id}")
        
        # Log in the user
        login_user(user_found)
        print(f"User {email} successfully logged in via Google token")
        
        # Save users to have a persistent record
        try:
            save_users()
            print("User data saved")
        except Exception as e:
            print(f"Warning: Could not save user data: {e}")
        
        return jsonify({'success': True, 'redirect': url_for('dashboard')}), 200
    
    except ValueError as ve:
        print(f"Token validation error: {str(ve)}")
        return jsonify({'error': f'Invalid token: {str(ve)}'}), 401
    except Exception as e:
        print(f"Google token verification error: {str(e)}")
        import traceback
        traceback.print_exc()  # Print the full traceback
        return jsonify({'error': f'Authentication failed: {str(e)}'}), 500

# New route for Google registration token handling
@app.route('/register/google/token', methods=['POST'])
def register_google_token():
    """Handle Google Sign-In token from client-side registration"""
    # Get token and user info from request
    token = request.form.get('id_token')
    username = request.form.get('username')
    email = request.form.get('email')
    
    print(f"Google token registration attempt - Username: {username}, Email: {email}")
    
    if not token or not username or not email:
        print(f"Missing required information - Token: {'Present' if token else 'Missing'}, Username: {'Present' if username else 'Missing'}, Email: {'Present' if email else 'Missing'}")
        return jsonify({'error': 'Missing required information'}), 400
    
    try:
        # Verify token
        print(f"Attempting to verify token with Google for email: {email}")
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                app.config['GOOGLE_CLIENT_ID']
            )
            print(f"Token verified successfully for: {email}")
        except Exception as e:
            print(f"Token verification failed: {str(e)}")
            print(f"Client ID used: {app.config['GOOGLE_CLIENT_ID']}")
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        
        # Check if the token is valid
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            print(f"Invalid token issuer: {idinfo['iss']}")
            return jsonify({'error': 'Invalid token issuer'}), 401
        
        # Verify that email from token matches email from form
        token_email = idinfo['email']
        print(f"Comparing emails - Token: {token_email}, Form: {email}")
        if token_email != email:
            print(f"Email mismatch - Token: {token_email}, Form: {email}")
            return jsonify({'error': 'Email mismatch'}), 400
            
        # Check if email is verified with Google
        email_verified = idinfo.get('email_verified', False)
        print(f"Email verified with Google: {email_verified}")
        if not email_verified:
            print(f"Email not verified with Google: {email}")
            return jsonify({'error': 'Email not verified with Google'}), 401
        
        # Get Google ID
        google_id = idinfo['sub']
        print(f"Google ID: {google_id}")
        
        # Check if user with this email already exists
        print(f"Checking if user with email {email} already exists")
        existing_user = None
        for user_id, user in users.items():
            if user.email == email:
                existing_user = user
                print(f"User with email {email} already exists - User ID: {user_id}")
                break
                
        if existing_user:
            print(f"Logging in existing user: {existing_user.username}")
            login_user(existing_user)
            return jsonify({'success': True, 'redirect': url_for('dashboard')}), 200
        
        # Check if username is already taken
        print(f"Checking if username {username} is already taken")
        username_taken = False
        for user in users.values():
            if user.username == username:
                username_taken = True
                print(f"Username {username} is already taken")
                break
                
        if username_taken:
            return jsonify({'error': 'Username already taken'}), 400
        
        # Create new user with Google info
        user_id = str(uuid.uuid4())
        print(f"Creating new user with ID: {user_id}")
        
        # Generate a random secure password
        random_password = secrets.token_urlsafe(16)
        print("Generated secure random password")
        
        hashed_password = generate_password_hash(random_password)
        print("Password hashed successfully")
        
        # Create the user
        try:
            new_user = User(
                id=user_id,
                username=username,
                email=email,
                password_hash=hashed_password,
                is_verified=True,  # User is verified via Google
                google_id=google_id
            )
            print(f"User object created successfully - ID: {user_id}, Username: {username}")
            
            # Store the user
            users[user_id] = new_user
            print(f"User added to users dictionary - Total users: {len(users)}")
            
            # Initialize empty trades list
            trades_db[user_id] = []
            print(f"Empty trades list initialized for user: {user_id}")
            
            # Save users data
            save_users()
            print("User data saved to CSV")
            
            # Log in the user
            login_user(new_user)
            print(f"User logged in successfully: {new_user.username}")
            
            # Return success response
            print(f"Registration successful for {username} with Google account")
            return jsonify({'success': True, 'redirect': url_for('dashboard')}), 200
        except Exception as e:
            print(f"Error creating or saving user: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return jsonify({'error': f'User creation failed: {str(e)}'}), 500
    
    except ValueError as e:
        # Invalid token
        print(f"Invalid token error: {str(e)}")
        return jsonify({'error': f'Invalid token: {str(e)}'}), 401
    except Exception as e:
        print(f"Google registration error: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True) 