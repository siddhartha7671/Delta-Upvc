from flask import Blueprint, jsonify, request
from database import admins_collection, login_logs, system_logs, get_now
import datetime
import os
import smtplib
from email.mime.text import MIMEText

auth_bp = Blueprint('auth', __name__)

SENDER_EMAIL = os.environ.get("SENDER_EMAIL")
SENDER_PASS = os.environ.get("SENDER_PASS")

def log_system_event(event_type, message, user_identity="SYSTEM"):
    try:
        system_logs.insert_one({
            "event": event_type,
            "message": message,
            "user": user_identity,
            "timestamp": get_now()
        })
    except: pass

def send_onboarding_email(target_email, name, username, password):
    if not target_email or "@" not in target_email: return False
    try:
        msg = MIMEText(f"Hello {name},\n\nCredentials: {username} / {password}")
        msg['Subject'] = "Delta UPVC: Your Portal Access Credentials"
        msg['From'] = SENDER_EMAIL
        msg['To'] = target_email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            if SENDER_PASS != "YOUR_GMAIL_APP_PASSWORD":
                server.login(SENDER_EMAIL, SENDER_PASS)
                server.send_message(msg)
        return True
    except: return False

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No credentials provided"}), 400
    username = data.get('username')
    password = data.get('password')
    user = admins_collection.find_one({"username": username, "password": password}, {'_id': 0})
    if user:
        login_logs.insert_one({
            "username": username,
            "role": user['role'],
            "login_time": get_now(),
            "ip": request.remote_addr
        })
        return jsonify({"status": "success", "admin": username, "role": user['role']})
    return jsonify({"status": "error", "message": "Invalid Credentials"}), 401

@auth_bp.route('/admin/users', methods=['GET'])
def get_users():
    users = list(admins_collection.find({}, {'_id': 0, 'password': 0}).sort("created_at", -1))
    return jsonify(users)

@auth_bp.route('/admin/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    is_update = data.get('isUpdate', False)
    username = data.get('username')
    
    if is_update:
        admins_collection.update_one({"username": username}, {"$set": data})
        log_system_event("USER_UPDATE", f"Profile for {username} updated", "ADMIN")
        return jsonify({"status": "success", "message": "Updated"})
    
    if admins_collection.find_one({"username": username}):
        return jsonify({"status": "error", "message": "Exists"}), 400
        
    data['created_at'] = get_now()
    admins_collection.insert_one(data)
    send_onboarding_email(data.get('email'), data.get('name'), username, data.get('password'))
    return jsonify({"status": "success", "message": "Added"})

@auth_bp.route('/admin/delete_user', methods=['DELETE'])
def delete_user():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400
    username = data.get('username')
    if username == "ceo_delta": return jsonify({"status": "error"}), 400
    admins_collection.delete_one({"username": username})
    return jsonify({"status": "success"})
