import logging
from flask import Flask, render_template, request, redirect, url_for, flash
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'default_secret_key')

# Configure Logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# MongoDB configuration
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['places_db']
itineraries_collection = db['itineraries']
map_entries_collection = db['map_entries']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_itinerary', methods=['POST'])
def add_itinerary():
    itinerary_name = request.form.get('itinerary_name')
    user_id = request.form.get('user_id')

    # Validate inputs
    if not all([itinerary_name, user_id]):
        flash('Itinerary Name and User ID are required!', 'error')
        logger.warning("Itinerary Name or User ID missing.")
        return redirect(url_for('index'))

    itinerary = {
        'itinerary_name': itinerary_name,
        'user_id': user_id,
        'entries': []  # Initialize with empty list
    }

    try:
        result = itineraries_collection.insert_one(itinerary)
        logger.debug(f"Inserted itinerary with _id: {result.inserted_id}")
        flash('Itinerary added successfully!', 'success')
    except Exception as e:
        logger.error(f"Error inserting itinerary: {e}")
        flash(f'An error occurred: {e}', 'error')

    return redirect(url_for('index'))

@app.route('/add_entry/<itinerary_id>', methods=['GET', 'POST'])
def add_entry(itinerary_id):
    logger.debug(f"Received itinerary_id: {itinerary_id}")

    # Convert itinerary_id to ObjectId
    try:
        itinerary_obj_id = ObjectId(itinerary_id)
        logger.debug(f"Converted to ObjectId: {itinerary_obj_id}")
    except Exception as e:
        logger.error(f"Error converting itinerary_id to ObjectId: {e}")
        flash('Invalid itinerary ID format!', 'error')
        return redirect(url_for('view_itineraries'))

    # Fetch the itinerary from the database
    try:
        itinerary = itineraries_collection.find_one({'_id': itinerary_obj_id})
        logger.debug(f"Found itinerary: {itinerary}")
    except Exception as e:
        logger.error(f"Error querying itinerary: {e}")
        flash('An error occurred while fetching the itinerary.', 'error')
        itinerary = None

    if not itinerary:
        flash('Itinerary not found!', 'error')
        return redirect(url_for('view_itineraries'))

    if request.method == 'POST':
        # Extract form data
        location_name = request.form.get('location_name')
        address = request.form.get('address')  # New address field
        time_start = request.form.get('time_start')
        time_end = request.form.get('time_end')
        notes = request.form.get('notes')

        logger.debug("Form data received:")
        logger.debug(f"location_name: {location_name}")
        logger.debug(f"address: {address}")
        logger.debug(f"time_start: {time_start}")
        logger.debug(f"time_end: {time_end}")
        logger.debug(f"notes: {notes}")

        # Validate inputs
        if not all([location_name, address, time_start, time_end]):
            flash('All fields except notes are required!', 'error')
            logger.warning("Form submission missing required fields.")
            return redirect(url_for('add_entry', itinerary_id=itinerary_id))

        try:
            # Convert times to datetime objects
            time_start_dt = datetime.strptime(time_start, '%Y-%m-%dT%H:%M')
            time_end_dt = datetime.strptime(time_end, '%Y-%m-%dT%H:%M')
            logger.debug(f"Parsed time_start: {time_start_dt}, time_end: {time_end_dt}")
        except ValueError as ve:
            flash('Invalid date/time format!', 'error')
            logger.error(f"Date/time parsing error: {ve}")
            return redirect(url_for('add_entry', itinerary_id=itinerary_id))

        if time_end_dt <= time_start_dt:
            flash('End time must be after start time!', 'error')
            logger.warning("End time is not after start time.")
            return redirect(url_for('add_entry', itinerary_id=itinerary_id))

        # Create the entry dictionary without user_id
        try:
            entry = {
                'location_name': location_name,
                'address': address,  # Include address
                'time_start': time_start_dt,
                'time_end': time_end_dt,
                'notes': notes
            }
            logger.debug(f"Prepared entry: {entry}")
        except ValueError as ve:
            flash('Invalid latitude or longitude values!', 'error')
            logger.error(f"Error converting latitude/longitude: {ve}")
            return redirect(url_for('add_entry', itinerary_id=itinerary_id))

        # Push the new entry to the entries array
        try:
            result = itineraries_collection.update_one(
                {'_id': itinerary_obj_id},
                {'$push': {'entries': entry}}
            )
            if result.modified_count > 0:
                logger.info(f"Successfully added entry to itinerary {itinerary_obj_id}: {entry}")
                flash('Entry added successfully!', 'success')
            else:
                logger.warning(f"No documents were modified when adding entry: {entry}")
                flash('Failed to add entry. Please try again.', 'error')
        except Exception as e:
            logger.error(f"Error adding entry: {e}")
            flash(f'An error occurred: {e}', 'error')

        return redirect(url_for('add_entry', itinerary_id=itinerary_id))

    return render_template('add_entry.html', itinerary=itinerary)

@app.route('/view_itineraries')
def view_itineraries():
    try:
        # Fetch itineraries from the database
        itineraries = list(itineraries_collection.find())
        logger.debug(f"Fetched {len(itineraries)} itineraries.")

        # Convert date fields to datetime objects
        for itinerary in itineraries:
            for entry in itinerary.get('entries', []):
                if isinstance(entry.get('time_start'), dict) and '$date' in entry['time_start']:
                    entry['time_start'] = datetime.fromtimestamp(
                        int(entry['time_start']['$date']['$numberLong']) / 1000
                    )
                if isinstance(entry.get('time_end'), dict) and '$date' in entry['time_end']:
                    entry['time_end'] = datetime.fromtimestamp(
                        int(entry['time_end']['$date']['$numberLong']) / 1000
                    )
    except Exception as e:
        logger.error(f"Error fetching itineraries: {e}")
        flash(f'An error occurred: {e}', 'error')
        itineraries = []

    # Render the template with processed itineraries
    return render_template('view_itineraries.html', itineraries=itineraries)
def add_map_entry():
    if request.method == 'POST':
        location = request.form.get('location')
        address = request.form.get('address')
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')

        logger.debug("Form data received for map entry:")
        logger.debug(f"location: {location}")
        logger.debug(f"latitude: {latitude}")
        logger.debug(f"longitude: {longitude}")

        # Validate inputs
        if not all([location, address, latitude, longitude]):
            flash('All fields are required!', 'error')
            logger.warning("Map entry submission missing required fields.")
            return redirect(url_for('add_map_entry'))

        try:
            map_entry = {
                'location': location,
                'address': address,
                'coordinates': {
                    'latitude': float(latitude),
                    'longitude': float(longitude)
                }
            }
            result = map_entries_collection.insert_one(map_entry)
            logger.debug(f"Inserted map entry: {map_entry}")
            flash('Map entry added successfully!', 'success')
        except Exception as e:
            logger.error(f"Error inserting map entry: {e}")
            flash(f'An error occurred: {e}', 'error')

        return redirect(url_for('add_map_entry'))

    return render_template('add_map_entry.html')

@app.route('/view_map_entries')
def view_map_entries():
    try:
        map_entries = list(map_entries_collection.find())
        logger.debug(f"Fetched {len(map_entries)} map entries.")
    except Exception as e:
        logger.error(f"Error fetching map entries: {e}")
        flash(f'An error occurred: {e}', 'error')
        map_entries = []
    return render_template('view_map_entries.html', map_entries=map_entries)

if __name__ == '__main__':
    app.run(debug=True)
