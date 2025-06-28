from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db
from routes import auth_bp, trades_bp, users_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=["http://localhost:3000",
                       "http://localhost:5173"], 
         supports_credentials=True)
    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(trades_bp, url_prefix='/api/trades')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    @app.route('/api/health')
    def health_check():
        return {"status": "healthy", "message": "Trading Journal API is running"}

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000) 