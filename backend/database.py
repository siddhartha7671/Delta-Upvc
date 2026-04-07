import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")

if not MONGO_URI:
    print("⚠️ WARNING: MONGO_URI not set! Check your .env file.")

client = MongoClient(MONGO_URI) if MONGO_URI else None
db = client['delta_upvc_portal'] if client else None

def verify_connection():
    try:
        client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB Ping Error: {e}")
        return False

# Collections
tasks_collection = db['tasks']
admins_collection = db['admins']
login_logs = db['login_logs']
contacts_collection = db['contacts']
system_logs = db['system_logs']
attendance_logs = db['attendance_logs']

def init_system():
    import datetime
    if verify_connection():
        if admins_collection.count_documents({"username": "ceo_delta"}) == 0:
            admins_collection.insert_one({
                "name": os.environ.get("CEO_NAME", "Delta CEO"),
                "phone": os.environ.get("CEO_PHONE", "9515244667"),
                "email": os.environ.get("CEO_EMAIL", "deltaupvc2025@gmail.com"),
                "username": "ceo_delta",
                "password": os.environ.get("CEO_PASS", "ceo2025"),
                "role": "CEO",
                "created_at": datetime.datetime.now()
            })
            print("👤 Master CEO Account Initialized.")

init_system()
