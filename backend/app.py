import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app)

# --- EMAIL CONFIGURATION (SMTP) ---
# Replace with your actual Gmail App Password to enable live sending!
SENDER_EMAIL = "deltaupvc2025@gmail.com"
SENDER_PASS = "kfdl xanz hlrm tbrz" 

def send_onboarding_email(target_email, name, username, password):
    if not target_email or "@" not in target_email:
        return False
    
    try:
        msg = MIMEText(f"""
        Hello {name},

        Welcome to the Delta UPVC Corporate Team!
        Your enterprise portal credentials have been generated:

        Username: {username}
        Password: {password}

        Login here: http://localhost:5173/portal

        Please change your password after your first login.
        - Delta UPVC Administration
        """)
        
        msg['Subject'] = "Delta UPVC: Your Portal Access Credentials"
        msg['From'] = SENDER_EMAIL
        msg['To'] = target_email

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            if SENDER_PASS != "YOUR_GMAIL_APP_PASSWORD":
                server.login(SENDER_EMAIL, SENDER_PASS) 
                server.send_message(msg)
                print(f"LIVE EMAIL SENT TO: {target_email}")
            else:
                print(f"SIMULATED EMAIL (Missing Password) TO: {target_email}")
        return True
    except Exception as e:
        print(f"EMAIL ERROR: {e}")
        return False

# --- MONGODB ATLAS CONNECTION ---
MONGO_URI = "mongodb+srv://mantenarangaraju2004_db_user:vMyAtTwaO098ZacA@cluster0.r9jjucy.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client['delta_upvc_portal']
# COLLECTIONS
tasks_collection = db['tasks']
admins_collection = db['admins']
login_logs = db['login_logs'] # To store login history
contacts_collection = db['contacts']

@app.route('/api/admin/add_task', methods=['POST'])
def add_task():
    data = request.get_json()
    task_name = data.get('task')
    assignee = data.get('assignee')
    deadline = data.get('deadline')
    submission_date = data.get('submission_date', '')
    status = data.get('status', 'Pending') # Default status
    
    if not task_name or not assignee:
        return jsonify({"message": "Task and Assignee are required"}), 400
        
    try:
        tasks_collection.insert_one({
            "task": task_name,
            "assignee": assignee,
            "deadline": deadline,
            "submission_date": submission_date,
            "status": status,
            "created_at": datetime.datetime.now()
        })
        return jsonify({"message": f"Successfully logged site visit by @{assignee}!", "status": "success"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# INITIALIZE ADMIN DATA (IF MISSING)
def init_mongo_admin():
    try:
        # Check connection status
        client.admin.command('ping')
        print("Delta UPVC: Persistent Cloud Database Online.")
        
        # REMOVED CLEANUP CODE - DATA NOW PERSISTS FOREVER
        
        if admins_collection.count_documents({}) == 0:
            # Primary CEO Account (Master) 
            # You can log in with this to create your real team manually!
            admins_collection.insert_one({
                "name": "Delta CEO",
                "phone": "9515244667",
                "email": "deltaupvc2025@gmail.com",
                "username": "ceo_delta",
                "password": "ceo2025",
                "role": "CEO",
                "created_at": datetime.datetime.now()
            })
            print("MongoDB: Master CEO Account Initialized.")
    except Exception as e:
        print(f"MongoDB Init Error: {e}")

init_mongo_admin()

# --- ADMIN API: DELETE USER ---
@app.route('/api/admin/delete_user', methods=['DELETE'])
def delete_user():
    data = request.get_json()
    username = data.get('username')
    
    if not username or username == "ceo_delta": # Safety: Cannot delete Master CEO
        return jsonify({"message": "Invalid deletion request.", "status": "error"}), 400
        
    try:
        res = admins_collection.delete_one({"username": username})
        if res.deleted_count > 0:
            return jsonify({"message": f"Successfully removed {username} from team.", "status": "success"})
        return jsonify({"message": "User not found.", "status": "error"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# DYNAMIC SERVICES DATA
SERVICES = [
    { 
        "id": 1,
        "title": "UPVC Sliding Windows", 
        "desc": "Smooth, space-saving sliding functionality with superior insulation.", 
        "color": "#e11d48",
        "features": ["Water Resistance", "UV Protected", "Thermal Efficiency"]
    },
    { 
        "id": 2,
        "title": "Premium Doors", 
        "desc": "Durable, elegant composite doors offering maximum security.", 
        "color": "#f472b6",
        "features": ["Multi-point Locking", "Wind Resistance", "Soundproof"]
    },
    { 
        "id": 3,
        "title": "Casement Windows", 
        "desc": "Classic style with modern UPVC energy-saving technology.", 
        "color": "#fb923c",
        "features": ["Air Tightness", "Corrosion Resistant", "Low Maintenance"]
    },
    { 
        "id": 4,
        "title": "Repair & Maintenance", 
        "desc": "Dedicated after-sales support and precision repair services.", 
        "color": "#10b981",
        "features": ["Glass Replacement", "Frame Aligning", "Hardware Upgrades"]
    }
]

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "info": "Delta UPVC Windows - Enterprise MongoDB Backend",
        "status": "online",
        "database": "MongoDB Atlas Cluster",
        "version": "3.0.0"
    })

@app.route('/api/services', methods=['GET'])
def get_services():
    return jsonify(SERVICES)

# --- CONTACT FORM API (WITH MONGODB PERSISTENCE) ---
@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')
    email = data.get('email', '')
    interest = data.get('interest', 'General Inquiry')
    now = datetime.datetime.now()

    if not name or not phone:
        return jsonify({"message": "Error: Name and Phone are required."}), 400

    try:
        inquiry = {
            "name": name,
            "phone": phone,
            "email": email,
            "interest": interest,
            "timestamp": now
        }
        result = contacts_collection.insert_one(inquiry)
        
        print(f"NEW CLOUD INQUIRY: {name} (ID: {result.inserted_id})")
        return jsonify({
            "message": f"Thank you {name}, we have received your inquiry. Our manager will contact you soon!",
            "status": "success",
            "db": "MongoDB Atlas"
        })
    except Exception as e:
        print(f"DATABASE ERROR: {e}")
        return jsonify({"message": "Cloud Storage Error.", "status": "error"}), 500

# --- ADMIN API: FETCH & UPDATE TASKS ---
@app.route('/api/admin/tasks', methods=['GET'])
def get_tasks_endpoint():
    try:
        tasks = []
        for t in list(tasks_collection.find().sort("created_at", -1)):
            t['_id'] = str(t['_id'])
            tasks.append(t)
        return jsonify(tasks)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/update_task_status', methods=['POST'])
def update_task_status():
    data = request.get_json()
    task_id = data.get('task_id')
    new_status = data.get('status')
    if not task_id or not new_status:
        return jsonify({"message": "Missing info"}), 400
    try:
        tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": {"status": new_status}})
        return jsonify({"message": "Status updated successfully", "status": "success"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/delete_task', methods=['DELETE'])
def delete_task():
    data = request.get_json()
    task_id = data.get('task_id')
    if not task_id:
        return jsonify({"message": "Task identity required"}), 400
    try:
        tasks_collection.delete_one({"_id": ObjectId(task_id)})
        return jsonify({"message": "Task log removed successfully", "status": "success"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/edit_task', methods=['POST'])
def edit_task():
    data = request.get_json()
    task_id = data.get('task_id')
    if not task_id:
        return jsonify({"message": "Task identity required"}), 400
    
    update_fields = {}
    if 'task' in data: update_fields['task'] = data['task']
    if 'deadline' in data: update_fields['deadline'] = data['deadline']
    if 'submission_date' in data: update_fields['submission_date'] = data['submission_date']
    if 'created_at_date' in data: update_fields['created_at_date'] = data['created_at_date']
    
    try:
        tasks_collection.update_one({"_id": ObjectId(task_id)}, {"$set": update_fields})
        return jsonify({"message": "Task updated successfully", "status": "success"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/logs', methods=['GET'])
def get_logs():
    try:
        logs = list(login_logs.find({}, {'_id': 0}).sort("login_time", -1))
        return jsonify(logs)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    try:
        users = list(admins_collection.find({}, {'_id': 0, 'password': 0}).sort("created_at", -1))
        return jsonify(users)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    is_update = data.get('isUpdate', False)
    name = data.get('name')
    phone = data.get('phone')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'Employe')
    gender = data.get('gender', '')
    dob = data.get('dob', '')
    profile_pic = data.get('profile_pic', '')
    
    try:
        # 1. UPDATE MODE
        if is_update:
            update_data = { "name": name, "phone": phone, "email": email, "role": role }
            if gender: update_data["gender"] = gender
            if dob: update_data["dob"] = dob
            if profile_pic: update_data["profile_pic"] = profile_pic
            # Only change password if user entered a new one
            if password and len(password.strip()) > 0:
                update_data["password"] = password
            admins_collection.update_one({"username": username}, {"$set": update_data})
            return jsonify({"message": f"Profile for {username} updated successfully!", "status": "success"})
            
        # 2. CREATE MODE
        if not name or not username or not password:
            return jsonify({"message": "Name, Username, and password are required"}), 400
            
        if admins_collection.find_one({"username": username}):
            return jsonify({"message": "Username already exists"}), 400
            
        admins_collection.insert_one({
            "name": name, "phone": phone, "email": email,
            "username": username, "password": password, "role": role,
            "gender": gender, "dob": dob, "profile_pic": profile_pic,
            "created_at": datetime.datetime.now()
        })

        # Send automatic email
        email_sent = send_onboarding_email(email, name, username, password)
        status_msg = f"Successfully added {name}! Credentials sent to {email}." if email_sent else f"Successfully added {name}!"
        
        return jsonify({"message": status_msg, "status": "success", "email_notification": email_sent})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/update_location', methods=['POST'])
def update_location():
    data = request.get_json()
    username = data.get('username')
    lat = data.get('lat')
    lng = data.get('lng')
    
    if not username or lat is None or lng is None:
        return jsonify({"message": "Incomplete location data"}), 400
        
    try:
        admins_collection.update_one(
            {"username": username},
            {"$set": {
                "location": {"lat": lat, "lng": lng},
                "last_seen": datetime.datetime.now()
            }}
        )
        return jsonify({"message": "Location updated", "status": "success"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/admin/locations', methods=['GET'])
def get_locations():
    try:
        users = list(admins_collection.find(
            {"location": {"$exists": True}},
            {"_id": 0, "username": 1, "name": 1, "location": 1, "last_seen": 1, "role": 1, "profile_pic": 1}
        ))
        return jsonify(users)
    except Exception as e:
        return jsonify({"message": str(e)}), 500
            
        # 2. CREATE MODE
        if not name or not username or not password:
            return jsonify({"message": "Name, Username, and password are required"}), 400
            
        if admins_collection.find_one({"username": username}):
            return jsonify({"message": "Username already exists"}), 400
            
        admins_collection.insert_one({
            "name": name, "phone": phone, "email": email,
            "username": username, "password": password, "role": role,
            "gender": gender, "dob": dob, "profile_pic": profile_pic,
            "created_at": datetime.datetime.now()
        })

        # Send automatic email
        email_sent = send_onboarding_email(email, name, username, password)
        status_msg = f"Successfully added {name}! Credentials sent to {email}." if email_sent else f"Successfully added {name}!"
        
        return jsonify({"message": status_msg, "status": "success", "email_notification": email_sent})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# --- LOGIN API ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    try:
        user = admins_collection.find_one({"username": username, "password": password}, {'_id': 0})
        if user:
            # Record login event in history
            login_logs.insert_one({
                "username": username,
                "role": user['role'],
                "login_time": datetime.datetime.now(),
                "ip": request.remote_addr
            })
            
            return jsonify({
                "message": f"Welcome back, {user['role']}!",
                "status": "success",
                "admin": username,
                "role": user['role']
            })
        else:
            return jsonify({"message": "Invalid Cloud Credentials", "status": "error"}), 401
    except Exception as e:
        return jsonify({"message": "DB Auth Error", "status": "error"}), 500

if __name__ == '__main__':
    print("Delta UPVC Cloud Backend booting up with MongoDB Atlas...")
    app.run(debug=True, host='0.0.0.0', port=5000)
