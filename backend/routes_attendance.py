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

    # Update Current Status in Master Admin Collection
    admins_collection.update_one({"username": username}, {"$set": {"attendance_status": status}})
    
    if status == 'online':
        # UPSERT today's log entry if first time clocking in today
        new_session = {"clock_in": time_str, "timestamp_in": now, "clock_in_selfie": data.get('selfie')}
        attendance_logs.update_one(
            {"username": username, "date": today_str}, 
            {"$push": {"sessions": new_session}, "$set": {"status": "online", "clock_in": time_str}}, 
            upsert=True
        )
    else:
        # User is clocking OFFLINE
        # 1. Find the latest log for this user (not strictly today, in case they cross midnight)
        log = attendance_logs.find_one({"username": username, "status": "online"}, sort=[("date", -1), ("sessions.timestamp_in", -1)])
        
        if not log or 'sessions' not in log or len(log['sessions']) == 0:
            # Fallback to today if no active session found
            log = attendance_logs.find_one({"username": username, "date": today_str})
            
        if log and 'sessions' in log and len(log['sessions']) > 0:
            # Find the first session that doesn't have a clock_out
            session_index = -1
            for i, s in enumerate(log['sessions']):
                if 'clock_out' not in s:
                    session_index = i
                    break
            
            if session_index != -1:
                last_session = log['sessions'][session_index]
                duration = int((now - last_session['timestamp_in']).total_seconds() / 60)
                
                # Close the session efficiently using positional operator
                attendance_logs.update_one(
                    {"username": username, "date": log['date'], f"sessions.{session_index}.clock_in": last_session['clock_in']},
                    {"$set": {
                        f"sessions.{session_index}.clock_out": time_str, 
                        f"sessions.{session_index}.duration": duration,
                        "status": "offline", 
                        "clock_out": time_str
                    }}
                )
            else:
                # No open session found, just set status for safety
                attendance_logs.update_one({"username": username, "date": today_str}, {"$set": {"status": "offline"}})
        else:
            # Emergency: Just update status so they can clock in again later
            attendance_logs.update_one({"username": username, "date": today_str}, {"$set": {"status": "offline", "clock_out": time_str}}, upsert=True)
    
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
