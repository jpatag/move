import json
import logging
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson import json_util
from datetime import datetime
import os
from dotenv import load_dotenv
import re
from datetime import datetime, timezone
from algo import (
    save_data,
    load_data,
    add_itinerary_to_graph,
    graph,
    time_action_data,
    print_graph,
    find_good_next_location,
    find_most_common_action_in_time_window,
    connect_to_mongodb,
    fetch_itineraries_from_mongodb
)
from flask_cors import CORS
# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'default_secret_key')
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure Logging
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# MongoDB configuration
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['places_db']
itineraries_collection = db['itineraries']
map_entries_collection = db['map_entries']

#Load Previous Data from MongoDB
data_file_path = './data.json'
collection = connect_to_mongodb(MONGO_URI, "places_db", "itineraries")
if collection is not None:  # Explicit None check
    itineraries = fetch_itineraries_from_mongodb(collection)
    
    # Load saved data if available
    graph, time_action_data = load_data(data_file_path)

    # Add itineraries to the graph one by one
    for itinerary in itineraries:
        add_itinerary_to_graph(itinerary, graph, time_action_data)

    #Print the resulting graph
    print_graph(graph)

#Initialize graph and time_action_data
save_data(graph, time_action_data, data_file_path)
graph, time_action_data = load_data(data_file_path)

def serialize_mongo(data):
    return json.loads(json_util.dumps(data))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/add_itinerary', methods=['POST'])
def add_itinerary():
    data = request.get_json()
    if not data:
        return jsonify({
            "success": False,
            "error": "No JSON data received"
        }), 400

    itinerary_name = data.get('itinerary_name')
    user_id = data.get('user_id')

    if not all([itinerary_name, user_id]):
        return jsonify({
            "success": False,
            "error": "Missing required fields"
        }), 400

    try:
        result = itineraries_collection.insert_one({
            'itinerary_name': itinerary_name,
            'user_id': user_id,
            'entries': []
        })
        
        return jsonify({
            "success": True,
            "data": {
                "id": str(result.inserted_id),
                "itinerary_name": itinerary_name,
                "user_id": user_id
            }
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/add_entry/<itinerary_id>', methods=['POST'])
def add_entry(itinerary_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data received"
            }), 400

        required_fields = ['location_name', 'address', 'time_start', 'time_end']
        if not all(field in data for field in required_fields):
            return jsonify({
                "success": False,
                "error": "Missing required fields"
            }), 400

        entry = {
            'location_name': data['location_name'],
            'address': data['address'],
            'time_start': datetime.fromisoformat(data['time_start']),
            'time_end': datetime.fromisoformat(data['time_end']),
            'notes': data.get('notes', '')
        }

        result = itineraries_collection.update_one(
            {'_id': ObjectId(itinerary_id)},
            {'$push': {'entries': entry}}
        )

        if result.modified_count == 0:
            return jsonify({
                "success": False,
                "error": "Itinerary not found or no changes made"
            }), 404

        # Update graph data
        updated_itinerary = itineraries_collection.find_one({'_id': ObjectId(itinerary_id)})
        add_itinerary_to_graph(updated_itinerary, graph, time_action_data)
        save_data(graph, time_action_data, data_file_path)

        return jsonify({
            "success": True,
            "data": serialize_mongo(entry)
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/itineraries', methods=['GET'])
def view_itineraries():
    try:
        itineraries = list(itineraries_collection.find())
        serialized = []
        
        for itinerary in itineraries:
            serialized_itinerary = serialize_mongo(itinerary)
            serialized_itinerary['id'] = str(itinerary['_id'])
            serialized.append(serialized_itinerary)
        
        return jsonify({
            "success": True,
            "data": serialized,
            "count": len(serialized)
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/location-suggestions', methods=['GET'])
def get_location_suggestions():
    try:
        search_term = request.args.get('search', '').strip()
        logger.debug(f"Search term received: '{search_term}'")
        
        regex_pattern = f"^{re.escape(search_term)}"
        results = list(map_entries_collection.find(
            {"location": {"$regex": regex_pattern, "$options": "i"}},
            {"_id": 0, "location": 1, "address": 1}
        ).limit(10))
        
        return jsonify({
            "success": True,
            "data": [serialize_mongo(loc) for loc in results]
        }), 200

    except Exception as e:
        logger.error(f"Error in get_location_suggestions: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/map_entries', methods=['POST'])
def add_map_entry():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data received"
            }), 400

        required_fields = ['location', 'address', 'latitude', 'longitude']
        if not all(field in data for field in required_fields):
            return jsonify({
                "success": False,
                "error": "Missing required fields"
            }), 400

        map_entry = {
            'location': data['location'],
            'address': data['address'],
            'coordinates': {
                'latitude': float(data['latitude']),
                'longitude': float(data['longitude'])
            }
        }

        result = map_entries_collection.insert_one(map_entry)
        
        return jsonify({
            "success": True,
            "data": {
                "id": str(result.inserted_id),
                **map_entry
            }
        }), 201

    except ValueError:
        return jsonify({
            "success": False,
            "error": "Invalid coordinate values"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/map_entries', methods=['GET'])
def view_map_entries():
    try:
        entries = list(map_entries_collection.find({}, {'_id': 0}))
        return jsonify({
            "success": True,
            "data": serialize_mongo(entries),
            "count": len(entries)
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/itineraries/<itinerary_id>')
def get_single_itinerary(itinerary_id):
    try:
        if not ObjectId.is_valid(itinerary_id):
            return jsonify({"success": False, "error": "Invalid ID format"}), 400

        # Fetch itinerary
        itinerary = itineraries_collection.find_one({'_id': ObjectId(itinerary_id)})
        if not itinerary:
            return jsonify({"success": False, "error": "Itinerary not found"}), 404

        itinerary = json_util.loads(json_util.dumps(itinerary))
        entries = itinerary.get('entries', [])
        processed_entries = []

        # Batch process locations using map_entries_collection
        location_names = [entry.get('location_name') for entry in entries]
        map_entries = list(map_entries_collection.find({
            "location": {"$in": location_names}
        }))

        # Create location->image mapping from map_entries
        location_image_map = {
            entry['location']: entry.get('image', 'https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg')
            for entry in map_entries
        }

        for entry in entries:
            processed_entry = entry.copy()
            location_name = entry.get('location_name', '')
            
            # Add image URL from map_entries
            processed_entry['image'] = location_image_map.get(
                location_name,
                'https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg'
            )

            # Existing date processing
            time_start = entry.get('time_start')
            if isinstance(time_start, dict) and '$date' in time_start:
                processed_entry['time_start'] = datetime.fromisoformat(time_start['$date'].rstrip('Z')).isoformat()
            else:
                processed_entry['time_start'] = datetime.utcnow().isoformat()

            time_end = entry.get('time_end')
            if isinstance(time_end, dict) and '$date' in time_end:
                processed_entry['time_end'] = datetime.fromisoformat(time_end['$date'].rstrip('Z')).isoformat()
            else:
                processed_entry['time_end'] = datetime.utcnow().isoformat()

            processed_entries.append(processed_entry)

        return jsonify({
            "success": True,
            "data": {
                "_id": str(itinerary['_id']),
                "itinerary_name": itinerary.get('itinerary_name', 'Unnamed Itinerary'),
                "user_id": itinerary.get('user_id', 'Unknown'),
                "notes": itinerary.get('notes', ''),
                "entries": processed_entries
            }
        })

    except Exception as e:
        logger.error(f"Error processing itinerary: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500

@app.route('/api/recommend-next', methods=['GET'])
def recommend_next_location():
    start = request.args.get('start')
    if not start:
        return jsonify({"success": False, "error": "Missing 'start' parameter"}), 400
    
    recommended = find_good_next_location(graph, start)
    if recommended is not None:
        return jsonify({
            "success": True,
            "data": {
                "current_location": start,
                "recommended_next_location": recommended
            }
        }), 200
    else:
        return jsonify({
            "success": False,
            "error": f"No recommendation found for '{start}' or it's a new trailblaze!"
        }), 404

@app.route('/api/common-action', methods=['GET'])
def get_common_action():
    time_str = request.args.get('time')
    if not time_str:
        return jsonify({"success": False, "error": "Missing 'time' parameter"}), 400
    
    try:
        # Parse the input time string into a datetime object
        query_time = datetime.now()
    except ValueError as e:
        return jsonify({"success": False, "error": f"Invalid time format: {e}. Use ISO format (e.g., '2023-10-10T14:30:00')"}), 400
    
    action = find_most_common_action_in_time_window(time_action_data, query_time)
    if action:
        return jsonify({
            "success": True,
            "data": {
                "query_time": query_time.isoformat(),
                "most_common_action": action
            }
        }), 200
    else:
        return jsonify({
            "success": True,
            "message": f"No popular action found around {query_time.time().strftime('%H:%M')}. Maybe go to bed?"
        }), 200

if __name__ == '__main__':
    app.run(debug=True)