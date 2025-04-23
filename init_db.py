"""
Skrip inisialisasi database untuk Trading Journal
Digunakan untuk membuat tabel dan memigrasikan data dari CSV ke PostgreSQL
"""
import os
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask
from models import db, User, Trade, UserPreference
from config import get_config

# Load environment variables
load_dotenv()

# Create Flask app for database initialization
app = Flask(__name__)
app.config.from_object(get_config())
db.init_app(app)

def create_tables():
    """Create all tables in the database"""
    with app.app_context():
        db.create_all()
        print("Tables created successfully!")

def migrate_csv_to_db():
    """Migrate users and trades from CSV to PostgreSQL"""
    with app.app_context():
        # Migration users
        if os.path.exists('users.csv'):
            print("Migrating users...")
            users_df = pd.read_csv('users.csv')
            for _, row in users_df.iterrows():
                try:
                    # Buat user ID baru (integer)
                    # Cek apakah username atau email sudah ada
                    existing_user = User.query.filter_by(email=row['email']).first()
                    if not existing_user:
                        new_user = User(
                            username=row['username'],
                            email=row['email'],
                            password_hash=row['password_hash'],
                            is_verified=row['is_verified'] if 'is_verified' in row else False,
                            google_id=row['google_id'] if 'google_id' in row and pd.notna(row['google_id']) else None
                        )
                        db.session.add(new_user)
                        print(f"Added user: {row['username']}")
                except Exception as e:
                    print(f"Error migrating user {row.get('username', '')}: {e}")
            
            db.session.commit()
            print(f"Migrated users")
        
        # Migration trades
        if os.path.exists('data/trades.csv'):
            print("Migrating trades...")
            trades_df = pd.read_csv('data/trades.csv')
            
            # Create user mapping if needed (old string ID to new integer ID)
            user_mapping = {}
            if 'id' in trades_df.columns and 'user_id' in trades_df.columns:
                for username in trades_df['user_id'].unique():
                    user = User.query.filter_by(username=username).first()
                    if user:
                        user_mapping[username] = user.id
            
            for _, row in trades_df.iterrows():
                try:
                    # Use the new user_id from the mapping or find by username
                    user_id = None
                    if 'user_id' in row:
                        user_ref = row['user_id']
                        if user_ref in user_mapping:
                            user_id = user_mapping[user_ref]
                        else:
                            # Try to find by username
                            user = User.query.filter_by(username=user_ref).first()
                            if user:
                                user_id = user.id
                                user_mapping[user_ref] = user_id
                    
                    if not user_id:
                        print(f"Skipping trade, no valid user found for: {row.get('user_id', 'unknown')}")
                        continue
                    
                    new_trade = Trade(
                        user_id=user_id,
                        date=datetime.strptime(row['date'], '%Y-%m-%d').date(),
                        symbol=row['symbol'],
                        trade_type=row['trade_type'],
                        broker=row['broker'],
                        entry_price=float(row['entry_price']),
                        exit_price=float(row['exit_price']),
                        size=float(row['size']),
                        stop_loss=float(row['stop_loss']) if 'stop_loss' in row and pd.notna(row['stop_loss']) else None,
                        take_profit=float(row['take_profit']) if 'take_profit' in row and pd.notna(row['take_profit']) else None,
                        strategy=row['strategy'],
                        notes=row['notes'] if 'notes' in row and pd.notna(row['notes']) else None,
                        screenshot_path=row['screenshot_path'] if 'screenshot_path' in row and pd.notna(row['screenshot_path']) else None
                    )
                    db.session.add(new_trade)
                except Exception as e:
                    print(f"Error migrating trade {row.get('id', '')}: {e}")
            
            db.session.commit()
            print(f"Migrated trades")

def create_user_preferences():
    """Create default preferences for users who don't have them yet"""
    with app.app_context():
        users = User.query.all()
        preferences_created = 0
        
        for user in users:
            # Check if user already has preferences
            if not UserPreference.query.filter_by(user_id=user.id).first():
                # Create default preferences
                preferences = UserPreference(
                    user_id=user.id,
                    default_currency='USD',
                    default_timeframe='Daily',
                    dark_mode=False
                )
                db.session.add(preferences)
                preferences_created += 1
        
        if preferences_created > 0:
            db.session.commit()
            print(f"Created default preferences for {preferences_created} users")
        else:
            print("No new user preferences needed to be created")

def print_db_stats():
    """Print database statistics"""
    with app.app_context():
        user_count = User.query.count()
        trade_count = Trade.query.count()
        pref_count = UserPreference.query.count()
        print(f"Database statistics:")
        print(f"Users: {user_count}")
        print(f"Trades: {trade_count}")
        print(f"User Preferences: {pref_count}")

if __name__ == "__main__":
    print("Starting database initialization...")
    
    # Create tables
    create_tables()
    
    # Migrate CSV data
    migrate_csv_to_db()
    
    # Create default user preferences
    create_user_preferences()
    
    # Print stats
    print_db_stats()
    
    print("Database initialization complete!") 