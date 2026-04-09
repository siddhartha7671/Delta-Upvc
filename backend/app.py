import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path

# Load ENV from the current directory explicitly
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Import App Components and Blueprints
from routes_auth import auth_bp
from routes_tasks import tasks_bp
from routes_attendance import attendance_bp
from routes_contacts import contacts_bp
from routes_analytics import analytics_bp
from routes_services import services_bp
from database import verify_connection

# Configure Logging for Production
if not os.path.exists('logs'):
    os.makedirs('logs')

log_formatter = logging.Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
file_handler = RotatingFileHandler('logs/server.log', maxBytes=1000000, backupCount=5)
file_handler.setFormatter(log_formatter)
file_handler.setLevel(logging.INFO)

app = Flask(__name__)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('Delta UPVC Backend Startup')

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Register Blueprints with unified /api prefix
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(tasks_bp, url_prefix='/api')
app.register_blueprint(attendance_bp, url_prefix='/api')
app.register_blueprint(contacts_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(services_bp, url_prefix='/api')

# Global Error Handler
from werkzeug.exceptions import HTTPException

@app.errorhandler(Exception)
def handle_exception(e):
    # Pass through HTTP errors
    if isinstance(e, HTTPException):
        return jsonify({
            "status": "error",
            "message": e.description
        }), e.code

    app.logger.error(f"Unhandled Exception: {str(e)}", exc_info=True)
    return jsonify({
        "status": "error",
        "message": "An internal server error occurred.",
        "details": str(e) if app.debug else None
    }), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "info": "Delta UPVC Modular Backend",
        "status": "online",
        "version": "4.0.0"
    })

@app.route('/api/app_version', methods=['GET'])
def get_app_version():
    """Returns the current backend and app version."""
    return jsonify({
        "version": "1.1.0",
        "build": "20260409",
        "environment": "development",
        "server_ip": "192.168.1.93" # Useful for mobile debugging
    })

@app.route('/api/check_update', methods=['GET'])
def check_update():
    """Logic to tell the phone app if it needs to update."""
    client_version = request.args.get('v', '1.0.0')
    latest_version = "1.1.0"
    
    # Simple logic: if versions don't match, suggest update
    needs_update = client_version != latest_version
    
    return jsonify({
        "latest_version": latest_version,
        "needs_update": needs_update,
        "update_url": "https://delta-upvc-portal.vercel.app/download", # Example URL
        "message": "A new version of Delta Portal is available!" if needs_update else "App is up to date"
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=False, host='0.0.0.0', port=port)
