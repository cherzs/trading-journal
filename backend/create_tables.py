
from app import create_app
from extensions import db

app = create_app()

with app.app_context():
    # Create all tables defined in your models
    db.create_all()
    print("Database tables created successfully!")
