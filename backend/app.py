from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db
from routes import auth_bp, trades_bp, users_bp, analytics_bp
from routes.uploads import uploads_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # More permissive CORS for development
    CORS(app, 
         origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"])
    
    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(trades_bp, url_prefix='/api/trades')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')

    @app.route('/api/health')
    def health_check():
        return {"status": "healthy", "message": "Trading Journal API is running"}

    # Add CORS preflight handler
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    return app

# Create the app instance at module level for gunicorn
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000) 