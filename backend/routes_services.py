from flask import Blueprint, jsonify

services_bp = Blueprint('services', __name__)

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

@services_bp.route('/services', methods=['GET'])
def get_services():
    return jsonify(SERVICES)
