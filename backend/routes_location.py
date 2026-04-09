from flask import Blueprint, jsonify, request
import datetime
import os
from database import admins_collection, db, get_now

location_bp = Blueprint('location', __name__)

# Using a dedicated collection for location history/logs
location_logs = db['location_logs']

@location_bp.route('/admin/track_location', methods=['POST'])
def track_location():
    """
    Receives periodic location updates (every 15 mins).
    Works even if the app is in background/minimized.
    """
    try:
        data = request.get_json()
        username = data.get('username')
        lat = data.get('lat')
        lng = data.get('lng')
        
        if not username or lat is None or lng is None:
            return jsonify({"status": "error", "message": "Missing required data"}), 400

        now = get_now()
        today_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")

        log_entry = {
            "username": username,
            "lat": lat,
            "lng": lng,
            "timestamp": now,
            "date": today_str,
            "time": time_str
        }

        # 1. Insert into dedicated history collection
        location_logs.insert_one(log_entry)

        # 2. Update current location in admins collection for live tracking
        admins_collection.update_one(
            {"username": username},
            {
                "$set": {
                    "location": {"lat": lat, "lng": lng},
                    "last_seen": now
                }
            }
        )

        return jsonify({"status": "success", "message": "Location logged successfully"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@location_bp.route('/admin/location_history', methods=['GET'])
def get_location_history():
    """Returns location history for a specific user and date."""
    username = request.args.get('username')
    date_str = request.args.get('date') # YYYY-MM-DD
    
    if not username:
        return jsonify({"status": "error", "message": "Username required"}), 400
        
    query = {"username": username}
    if date_str:
        query["date"] = date_str
        
    logs = list(location_logs.find(query, {"_id": 0}).sort("timestamp", -1))
    return jsonify(logs)
