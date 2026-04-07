from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

# Import Blueprints
from routes_auth import auth_bp
from routes_tasks import tasks_bp
from routes_attendance import attendance_bp
from routes_contacts import contacts_bp
from routes_analytics import analytics_bp
from routes_services import services_bp

from database import verify_connection

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Register Blueprints with unified /api prefix
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(tasks_bp, url_prefix='/api')
app.register_blueprint(attendance_bp, url_prefix='/api')
app.register_blueprint(contacts_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(services_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "info": "Delta UPVC Modular Backend",
        "status": "online",
        "version": "4.0.0"
    })

@app.route('/api/app_version', methods=['GET'])
def get_app_version():
    return jsonify({"version": "1.1.0"})

@app.route('/api/admin/app_metrics', methods=['GET'])
def get_app_metrics():
    # Placeholder to solve 404s from mobile/dashboard
    return jsonify({"status": "active", "metrics": {}})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=False, host='0.0.0.0', port=port)
