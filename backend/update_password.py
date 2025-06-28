from app import create_app
from models.user import User
from extensions import db
from werkzeug.security import generate_password_hash

def update_password():
    app = create_app()
    with app.app_context():
        # Update password for user with id = 3
        user = db.session.get(User, 3)
        if user:
            user.password_hash = generate_password_hash('password123')
            db.session.commit()
            print("Password updated successfully for user:", user.email)
        else:
            print("User not found")

if __name__ == "__main__":
    update_password() 