from flask import Flask, render_template, request, redirect, url_for, flash
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'default_secret_key')

# MongoDB configuration
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['places_db']
entries_collection = db['entries']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_entry', methods=['POST'])
def add_entry():
    time_begin = request.form.get('time_begin')
    time_end = request.form.get('time_end')
    place_name = request.form.get('place_name')
    location = request.form.get('location')

    # Validate inputs
    if not all([time_begin, time_end, place_name, location]):
        flash('All fields are required!', 'error')
        return redirect(url_for('index'))

    try:
        # Convert times to datetime objects
        time_begin_dt = datetime.strptime(time_begin, '%Y-%m-%dT%H:%M')
        time_end_dt = datetime.strptime(time_end, '%Y-%m-%dT%H:%M')
    except ValueError:
        flash('Invalid date/time format!', 'error')
        return redirect(url_for('index'))

    if time_end_dt <= time_begin_dt:
        flash('End time must be after begin time!', 'error')
        return redirect(url_for('index'))

    entry = {
        'time_begin': time_begin_dt,
        'time_end': time_end_dt,
        'place_name': place_name,
        'location': location
    }

    try:
        entries_collection.insert_one(entry)
        flash('Entry added successfully!', 'success')
    except Exception as e:
        flash(f'An error occurred: {e}', 'error')

    return redirect(url_for('index'))

@app.route('/view_entries')
def view_entries():
    try:
        entries = list(entries_collection.find().sort('time_begin', -1))
    except Exception as e:
        flash(f'An error occurred: {e}', 'error')
        entries = []
    return render_template('view_entries.html', entries=entries)

if __name__ == '__main__':
    app.run(debug=True)
