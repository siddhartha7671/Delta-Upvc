from flask import Blueprint, jsonify, request
from database import tasks_collection, admins_collection
import datetime

analytics_bp = Blueprint('analytics', __name__)

def calculate_user_points(username):
    tasks = list(tasks_collection.find({"assignee": username}))
    pts = 0
    for t in tasks:
        # Robust case-insensitive status check
        status = str(t.get('status', 'Pending')).upper()
        if status == 'PROCESSING':
            pts += 10
        elif status == 'DELIVERED':
            pts += 20
        else:
            pts += 5
    return pts

def get_level_info(pts):
    level = (pts // 70) + 1
    progress = ((pts % 70) / 70) * 100
    return level, progress

@analytics_bp.route('/admin/analytics', methods=['GET'])
def get_analytics():
    username = request.args.get('username')
    
    # 1. Fetch relevant tasks (filtered by user if requested)
    query = {}
    if username:
        query["assignee"] = username
    
    all_tasks = list(tasks_collection.find(query))
    
    # 2. Gauge Data
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")
    yesterday = datetime.datetime.now() - datetime.timedelta(days=1)
    yest_str = yesterday.strftime("%Y-%m-%d")

    today_tasks = [t for t in all_tasks if (t.get('created_at_date') or t.get('submission_date') or '').strip() == today_str]
    yest_tasks = [t for t in all_tasks if (t.get('created_at_date') or t.get('submission_date') or '').strip() == yest_str]

    count = len(today_tasks)
    yest_count = len(yest_tasks)
    target = 10
    percentage = min(round((count / target) * 100), 100)
    diff = count - yest_count
    trend = f"+{diff} from yesterday" if diff >= 0 else f"{diff} from yesterday"
    trend_color = '#10b981' if diff >= 0 else '#ef4444'

    # 3. Top Employee logic (CEO/Manager only sees this)
    top_emp = None
    if not username:
        users = list(admins_collection.find({"role": {"$ne": "CEO"}}))
        active_emps = []
        for u in users:
            pts = calculate_user_points(u['username'])
            active_emps.append({
                "username": u['username'],
                "name": u.get('name', u['username']),
                "pts": pts
            })
        if active_emps:
            top_emp = max(active_emps, key=lambda x: x['pts'])

    # 4. Stats Breakdown (Case-Insensitive)
    delivered = len([t for t in all_tasks if str(t.get('status', '')).upper() == 'DELIVERED'])
    processing = len([t for t in all_tasks if str(t.get('status', '')).upper() == 'PROCESSING'])
    pending = len([t for t in all_tasks if str(t.get('status', '')).upper() == 'PENDING'])

    return jsonify({
        "gauge": {
            "count": count,
            "percentage": percentage,
            "trend": trend,
            "trendColor": trend_color,
            "todayStr": today_str
        },
        "top_employee": top_emp,
        "breakdown": {
            "delivered": delivered,
            "processing": processing,
            "pending": pending,
            "total": len(all_tasks)
        }
    })

@analytics_bp.route('/admin/user_stats/<username>', methods=['GET'])
def get_user_stats(username):
    pts = calculate_user_points(username)
    level, progress = get_level_info(pts)
    return jsonify({
        "points": pts,
        "level": level,
        "progress": progress
    })
