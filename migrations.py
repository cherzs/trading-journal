from flask import Flask
from flask_migrate import Migrate
from models import db
from config import get_config

def create_app():
    """Create and configure the Flask application for database migrations."""
    app = Flask(__name__)
    app.config.from_object(get_config())
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    
    return app

app = create_app()

if __name__ == '__main__':
    # To initialize the database, run:
    # flask db init
    # 
    # To create a migration:
    # flask db migrate -m "Initial migration."
    # 
    # To apply migrations:
    # flask db upgrade
    print("This script is used for migrations. Run the following commands:")
    print("To initialize: flask db init")
    print("To create a migration: flask db migrate -m \"Your migration message\"")
    print("To apply migrations: flask db upgrade") 