from flask import Blueprint, jsonify, request
from database import tasks_collection, system_logs, get_now
from bson import ObjectId
import datetime

tasks_bp = Blueprint('tasks', __name__)

def log_system_event(event_type, message, user_identity="SYSTEM"):
    try:
        system_logs.insert_one({
            "event": event_type, "message": message, "user": user_identity, "timestamp": get_now()
        })
    except: pass

@tasks_bp.route('/admin/tasks', methods=['GET'])
def get_tasks():
    tasks = []
    for t in list(tasks_collection.find().sort("created_at", -1)):
        t['_id'] = str(t['_id'])
        if 'status' not in t:
            t['status'] = 'Pending'
        tasks.append(t)
    return jsonify(tasks)

@tasks_bp.route('/admin/add_task', methods=['POST'])
def add_task():
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400
    
    task_type = data.get('type', 'site_visit')
    photos = data.get('site_photos', [])
    
    if task_type == 'site_visit':
        print(f"DEBUG: Received add_task request from {data.get('assignee')} with {len(photos)} photos")
        if not photos or len(photos) < 1:
            print(f"DEBUG: Validation Failed. Photos count: {len(photos)}")
            return jsonify({"status": "error", "message": f"Minimum 1 site photo is mandatory. You provided {len(photos)}."}), 400

    data['created_at'] = get_now()
    if 'status' not in data:
        data['status'] = 'Pending'
    
    tasks_collection.insert_one(data)
    log_system_event("TASK_CREATE", f"Task/Visit logged with {len(photos)} photos", data.get('assignee', 'ADMIN'))
    return jsonify({"status": "success", "message": "Visit Logged Successfully"})


@tasks_bp.route('/admin/edit_task', methods=['POST'])
def edit_task():
    data = request.get_json()
    task_id = data.get('task_id')
    if not task_id:
        return jsonify({"status": "error", "message": "Task ID required"}), 400
    
    # Extract updates (don't overwrite task_id)
    updates = {k: v for k, v in data.items() if k != 'task_id'}
    updates['updated_at'] = get_now()
    
    tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": updates})
    return jsonify({"status": "success", "message": "Task updated successfully"})



@tasks_bp.route('/admin/update_task_status', methods=['POST'])
def update_task():
    data = request.get_json()
    if not data or 'task_id' not in data or 'status' not in data:
        return jsonify({"status": "error", "message": "Missing task_id or status"}), 400
    tasks_collection.update_one({"_id": ObjectId(data['task_id'])}, {"$set": {"status": data['status']}})
    return jsonify({"status": "success"})

@tasks_bp.route('/admin/delete_task', methods=['DELETE'])
def delete_task():
    task_id = request.get_json().get('task_id')
    tasks_collection.delete_one({"_id": ObjectId(task_id)})
    return jsonify({"status": "success"})
