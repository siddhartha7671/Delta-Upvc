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
    
    try:
        if status == 'online':
            # CLOCK IN LOGIC
            new_session = {"clock_in": time_str, "timestamp_in": now, "clock_in_selfie": data.get('selfie')}
            attendance_logs.update_one(
                {"username": username, "date": today_str}, 
                {"$push": {"sessions": new_session}, "$set": {"status": "online", "clock_in": time_str}}, 
                upsert=True
            )
        else:
            # CLOCK OUT LOGIC
            # Step 1: Find any open session for this user (status: online)
            log = attendance_logs.find_one({"username": username, "status": "online"}, sort=[("date", -1)])
            
            if log and 'sessions' in log:
                # Find the last session that doesn't have a clock_out
                sessions = log['sessions']
                target_idx = -1
                for idx, s in enumerate(reversed(sessions)):
                    if 'clock_out' not in s:
                        target_idx = len(sessions) - 1 - idx
                        break
                
                if target_idx != -1:
                    open_session = sessions[target_idx]
                    
                    # Ensure both datetimes are timezone-aware for the subtraction
                    ts_in = open_session['timestamp_in']
                    if ts_in.tzinfo is None:
                        # MongoDB stores as UTC; make it aware then convert to same zone as 'now'
                        from database import IST
                        ts_in = ts_in.replace(tzinfo=datetime.timezone.utc).astimezone(IST)
                    
                    # Calculate duration in minutes
                    diff = now - ts_in
                    duration = int(diff.total_seconds() / 60)
                    
                    # Update that specific session
                    update_query = {
                        "username": username, 
                        "date": log['date'], 
                        f"sessions.{target_idx}.clock_in": open_session['clock_in']
                    }
                    update_data = {
                        "$set": {
                            f"sessions.{target_idx}.clock_out": time_str,
                            f"sessions.{target_idx}.duration": duration,
                            "status": "offline",
                            "clock_out": time_str
                        }
                    }
                    attendance_logs.update_one(update_query, update_data)
                else:
                    # No open session found in the log, just mark as offline
                    attendance_logs.update_one({"username": username, "date": today_str}, {"$set": {"status": "offline", "clock_out": time_str}}, upsert=True)
            else:
                # No log found at all, just mark offline for today
                attendance_logs.update_one({"username": username, "date": today_str}, {"$set": {"status": "offline", "clock_out": time_str}}, upsert=True)
                
        return jsonify({"status": "success"})
    except Exception as e:
        print(f"ATTENDANCE ERROR: {str(e)}")
        # Even if log fails, ensure status is updated so user isn't stuck
        admins_collection.update_one({"username": username}, {"$set": {"attendance_status": status}})
        return jsonify({"status": "error", "message": str(e)}), 500

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
