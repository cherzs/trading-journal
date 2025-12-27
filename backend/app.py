from flask import Flask, request
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
         origins=[
             "http://localhost:3000", 
             "http://localhost:5173", 
             "http://127.0.0.1:5173", 
             "https://trading-journal-0mup.onrender.com", 
             "https://trading-journal-nu-brown.vercel.app"
             ],
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

    @app.route('/')
    def root():
        return {"message": "Trading Journal API - Use /api/health for health check"}, 200

    @app.route('/api')
    def api_root():
        return {"message": "Trading Journal API - Available endpoints: /api/auth, /api/trades, /api/analytics, /api/users"}, 200

    # Add CORS preflight handler
    @app.after_request
    def after_request(response):
        # Allow credentials and set appropriate headers for all allowed origins
        origin = request.headers.get('Origin')
        allowed_origins = [
            "http://localhost:3000", 
            "http://localhost:5173", 
            "http://127.0.0.1:5173", 
            "https://trading-journal-0mup.onrender.com", 
            "https://trading-journal-nu-brown.vercel.app"
        ]
        
        if origin in allowed_origins:
            response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    return app


# Create the app instance at module level for gunicorn
app = create_app()

# Auto-create tables on startup (for production)
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
 