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
    try:
        client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB Ping Error: {e}")
        return False

# Collections (Safe Access)
tasks_collection = db['tasks'] if db is not None else None
admins_collection = db['admins'] if db is not None else None
login_logs = db['login_logs'] if db is not None else None
contacts_collection = db['contacts'] if db is not None else None
system_logs = db['system_logs'] if db is not None else None
attendance_logs = db['attendance_logs'] if db is not None else None

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
                "created_at": get_now()
            })
            print("👤 Master CEO Account Initialized.")

init_system()
