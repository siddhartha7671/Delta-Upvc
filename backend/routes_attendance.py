from flask import Blueprint, jsonify, request
from database import attendance_logs, admins_collection, get_now
import datetime

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/admin/attendance', methods=['POST'])
def update_attendance():
    data = request.get_json()
    username = data.get('username')
    status = data.get('status')
    now = get_now()
    today_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")

    # Update Current Status
    admins_collection.update_one({"username": username}, {"$set": {"attendance_status": status}})
    
    log = attendance_logs.find_one({"username": username, "date": today_str})
    if status == 'online':
        new_session = {"clock_in": time_str, "timestamp_in": now, "clock_in_selfie": data.get('selfie')}
        attendance_logs.update_one({"username": username, "date": today_str}, {"$push": {"sessions": new_session}, "$set": {"status": "online", "clock_in": time_str}}, upsert=True)
    else:
        last_session = log['sessions'][-1]
        duration = int((now - last_session['timestamp_in']).total_seconds() / 60)
        attendance_logs.update_one({"username": username, "date": today_str, "sessions.clock_in": last_session['clock_in']}, {"$set": {"sessions.$.clock_out": time_str, "sessions.$.duration": duration, "status": "offline", "clock_out": time_str}})
    
    return jsonify({"status": "success"})

@attendance_bp.route('/admin/attendance_history', methods=['GET'])
def get_attendance():
    date_filter = request.args.get('date')
    logs = list(attendance_logs.find({"date": date_filter}, {'_id': 0}).sort("date", -1))
    for l in logs:
        u = admins_collection.find_one({"username": l['username']}, {"name": 1})
        l['name'] = u.get('name') if u else l['username']
    return jsonify(logs)

@attendance_bp.route('/admin/attendance_trace', methods=['PATCH'])
def track_trace():
    data = request.get_json()
    now = get_now()
    today_str = now.strftime("%Y-%m-%d")
    trace = {"lat": data['lat'], "lng": data['lng'], "time": now.strftime("%H:%M")}
    attendance_logs.update_one({"username": data['username'], "date": today_str}, {"$push": {"route_trace": trace}}, upsert=True)
    return jsonify({"status": "success"})

@attendance_bp.route('/admin/locations', methods=['GET'])
def get_locations():
    users = list(admins_collection.find({"location": {"$exists": True}}, {"_id": 0, "username": 1, "name": 1, "location": 1, "last_seen": 1, "role": 1, "profile_pic": 1}))
    return jsonify(users)

@attendance_bp.route('/admin/update_location', methods=['POST'])
def update_location():
    data = request.get_json()
    now = get_now()
    admins_collection.update_one({"username": data['username']}, {"$set": {"location": {"lat": data['lat'], "lng": data['lng']}, "last_seen": now}})
    return jsonify({"status": "success"})
