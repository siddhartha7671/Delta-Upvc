from flask import Blueprint, jsonify, request
from database import contacts_collection, get_now
import datetime

contacts_bp = Blueprint('contacts', __name__)

@contacts_bp.route('/contact', methods=['POST'])
def submit_contact():
    data = request.get_json()
    data['timestamp'] = get_now().strftime("%Y-%m-%d %H:%M:%S")
    contacts_collection.insert_one(data)
    return jsonify({"status": "success", "message": "Query Submitted! Our team will reach out to you shortly."})

@contacts_bp.route('/admin/contacts', methods=['GET'])
def get_contacts():
    contacts = list(contacts_collection.find({}, {'_id': 0}).sort("timestamp", -1))
    return jsonify(contacts)
