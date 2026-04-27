import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
import datetime

IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))

def get_now():
    return datetime.datetime.now(IST)

# Load ENV from the current directory explicitly
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.environ.get("MONGO_URI")

if not MONGO_URI:
    print("⚠️ WARNING: MONGO_URI not set! Check your .env file.")

client = MongoClient(
    MONGO_URI, 
    serverSelectionTimeoutMS=5000, 
    retryWrites=True
) if MONGO_URI else None

db = client['delta_upvc_portal'] if client else None

def verify_connection():
    if not client:
        print("ERROR: MongoDB Error: No client initialized (check MONGO_URI)")
        return False
    try:
        client.admin.command('ping')
        print("SUCCESS: MongoDB Connection: OK")
        return True
    except Exception as e:
        print(f"FAILED: MongoDB Ping Error: {e}")
        return False

# Collections (Safe Access)
tasks_collection = db['tasks'] if db is not None else None
admins_collection = db['admins'] if db is not None else None
login_logs = db['login_logs'] if db is not None else None
contacts_collection = db['contacts'] if db is not None else None
system_logs = db['system_logs'] if db is not None else None
attendance_logs = db['attendance_logs'] if db is not None else None

def init_system():
    if verify_connection():
        try:
            tasks_collection.create_index("assignee")
            tasks_collection.create_index("status")
            tasks_collection.create_index([("created_at", -1)])
            admins_collection.create_index("username", unique=True)
            attendance_logs.create_index([("username", 1), ("date", -1)])
            attendance_logs.create_index([("date", -1)])
            print("Database Indexes verified for ultra-fast queries.")
        except Exception as e:
            print(f"Index Error: {e}")


        if admins_collection.count_documents({"username": "ceo_delta"}) == 0:
            admins_collection.insert_one({
                "name": os.environ.get("CEO_NAME", "Delta CEO"),
                "phone": os.environ.get("CEO_PHONE", "9515244667"),
                "email": os.environ.get("CEO_EMAIL", "deltaupvc2025@gmail.com"),
                "username": "ceo_delta",
                "password": os.environ.get("CEO_PASS", "ceo2025"),
                "role": "CEO",
                "created_at": get_now()
            })
            print("Master CEO Account Initialized.")

init_system()
