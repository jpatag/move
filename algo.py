import json
import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
import tempfile
import shutil
import threading
from pymongo import MongoClient
from pymongo.errors import PyMongoError

collection_name = "itineraries"
db_name = "places_db"
mongodb_uri = "mongodb+srv://admin:ifsballs@cluster0.5mgvl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Global graph to store locations and their weights
graph = defaultdict(lambda: defaultdict(int))

# Global dictionary to store time-action data (specific times and actions)
time_action_data = defaultdict(lambda: defaultdict(int))

# File path to save data (same folder as the script)
file_path = './data.json'  # Since algo.py and data.json are in the same folder, this works

# Ensure the folder exists (if not, create it)
folder = os.path.dirname(file_path)
if not os.path.exists(folder) and folder != '.':
    os.makedirs(folder)

def save_data(graph, time_action_data, file_path):
    """
    Save the graph and time-action data to a JSON file.
    Converts datetime objects to ISO format strings for JSON serialization.
    """
    # Serialize graph with string keys
    graph_serializable = {
        k: {sub_k: v for sub_k, v in sub_dict.items()} for k, sub_dict in graph.items()
    }
    
    # Serialize time_action_data with datetime keys as ISO format strings
    time_action_data_serializable = {
        k.isoformat(): {sub_k: v for sub_k, v in sub_dict.items()} for k, sub_dict in time_action_data.items()
    }

    data = {
        'graph': graph_serializable,
        'time_action_data': time_action_data_serializable
    }

    # Write to a temporary file first to ensure atomicity
    dir_name = os.path.dirname(file_path)
    with tempfile.NamedTemporaryFile('w', delete=False, dir=dir_name, encoding='utf-8') as tmp_file:
        json.dump(data, tmp_file, indent=4)
        temp_name = tmp_file.name

    # Atomically replace the old file with the new one
    shutil.move(temp_name, file_path)


def load_data(file_path):
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if not content:
                    print("File is empty. Starting fresh.")
                    return defaultdict(lambda: defaultdict(int)), defaultdict(lambda: defaultdict(int))
                data = json.loads(content)
                # Deserialize graph
                graph_loaded = defaultdict(lambda: defaultdict(int), {
                    k: {sub_k: v for sub_k, v in sub_dict.items()}
                    for k, sub_dict in data['graph'].items()
                })
                # Deserialize time_action_data
                time_action_data_loaded = defaultdict(lambda: defaultdict(int), {
                    datetime.fromisoformat(k): {sub_k: v for sub_k, v in sub_dict.items()}
                    for k, sub_dict in data['time_action_data'].items()
                })
                print(f"Data loaded from {file_path}")
                return graph_loaded, time_action_data_loaded
        except json.JSONDecodeError as e:
            print(f"Error loading JSON data: {e}")
            print("Starting with fresh data.")
            return defaultdict(lambda: defaultdict(int)), defaultdict(lambda: defaultdict(int))
        except Exception as e:
            print(f"Unexpected error: {e}")
            print("Starting with fresh data.")
            return defaultdict(lambda: defaultdict(int)), defaultdict(lambda: defaultdict(int))
    else:
        print(f"No saved data found at {file_path}. Starting fresh.")
        return defaultdict(lambda: defaultdict(int)), defaultdict(lambda: defaultdict(int))

def add_itinerary_to_graph(itinerary, graph, time_action_data):
    try:
        # Sort entries by time_start (already a datetime object)
        entries = sorted(itinerary['entries'], key=lambda x: x['time_start'])
    except KeyError as e:
        print(f"Missing 'time_start' in entry: {e}")
        return

    for entry in entries:
        try:
            location_name = entry['location_name']
            start_time = entry['time_start']

            # 1. Convert naive datetime to UTC-aware datetime
            if start_time.tzinfo is None:
                start_time = start_time.replace(tzinfo=timezone.utc)
            else:
                start_time = start_time.astimezone(timezone.utc)

            # 2. Skip dates before 1601 (Windows compatibility)
            if start_time.year < 1601:
                print(f"Skipping invalid date: {start_time}")
                continue

            time_action_data[start_time][location_name] += 1
        except OSError as e:
            print(f"Skipping entry due to unsupported date: {e}")
            continue
        except KeyError as e:
            print(f"Missing key {e} in entry: {entry}")
            continue

    # Update the graph with valid entries
    locations = [entry['location_name'] for entry in entries if entry['time_start'].year >= 1601]
    for i in range(len(locations) - 1):
        current = locations[i]
        next_location = locations[i + 1]
        graph[current][next_location] += 1

def find_most_common_action_in_time_window(time_action_data, query_time):
    # Ensure query_time is UTC
    if query_time.tzinfo is None:
        query_time = query_time.replace(tzinfo=timezone.utc)
    
    window_start = query_time - timedelta(minutes=30)
    window_end = query_time + timedelta(minutes=30)
    
    action_counts = defaultdict(int)
    for recorded_time, actions in time_action_data.items():
        if window_start <= recorded_time <= window_end:
            for action, count in actions.items():
                action_counts[action] += count

    if action_counts:
        most_common_action = max(action_counts, key=action_counts.get)
        print(f"Most common activity around {query_time.time()} is going to the '{most_common_action}' with weight {action_counts[most_common_action]}")
    else:
        print(f"No popular action found around {query_time.time()}. Maybe time to go to bed?")

def find_good_next_location(graph, start):
    """
    Finds the most popular next location after a given starting location.
    """
    if start not in graph:
        print(f"None of your friends have gone to '{start}' before. You are a trailblazer!")
        return None

    edges = graph[start]
    max_weight = 0
    recommended_location = None

    for to_location, weight in edges.items():
        if weight > max_weight:
            max_weight = weight
            recommended_location = to_location

    if recommended_location:
        print(f"People frequently go to '{recommended_location}' after visiting '{start}'.")
    else:
        print(f"No popular next location found for '{start}'.")

    return recommended_location

def print_graph(graph):
    """
    Prints the location graph with weights in a readable format.
    """
    print("\nLocation Graph with Weights:")
    for from_location, edges in graph.items():
        for to_location, weight in edges.items():
            print(f"{from_location} -> {to_location}: {weight}")

def connect_to_mongodb(uri, db_name, collection_name):
    try:
        client = MongoClient(uri)
        db = client[db_name]
        collection = db[collection_name]
        print("Connected to MongoDB successfully!")
        return collection
    except PyMongoError as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

# Fetch itineraries from MongoDB
def fetch_itineraries_from_mongodb(collection):
    try:
        itineraries = list(collection.find({}))  # Fetch all documents in the collection
        print(f"Fetched {len(itineraries)} itineraries from MongoDB.")
        return itineraries
    except PyMongoError as e:
        print(f"Error fetching data from MongoDB: {e}")
        return []

# Example itineraries
itinerary1 = {
    "_id": "1",
    "user_id": "user1",
    "name": "Vacation in Paris",
    "entries": [
        {
            "location": {
                "name": "Eiffel Tower",
                "coordinates": {"lat": 48.858844, "lng": 2.294351}
            },
            "start_time": "2025-01-25T10:00:00Z",
            "end_time": "2025-01-25T12:00:00Z",
            "notes": "Take pictures at sunrise."
        },
        {
            "location": {
                "name": "Louvre Museum",
                "coordinates": {"lat": 48.860611, "lng": 2.337644}
            },
            "start_time": "2025-01-25T13:00:00Z",
            "end_time": "2025-01-25T16:00:00Z",
            "notes": "Visit the Mona Lisa and other exhibits."
        }
    ],
    "created_at": "2025-01-20T08:00:00Z",
    "updated_at": "2025-01-23T18:00:00Z"
}

itinerary2 = {
    "_id": "2",
    "user_id": "user2",
    "name": "Paris Highlights",
    "entries": [
        {
            "location": {
                "name": "Eiffel Tower",
                "coordinates": {"lat": 48.858844, "lng": 2.294351}
            },
            "start_time": "2025-01-25T09:30:00Z",
            "end_time": "2025-01-25T11:00:00Z",
            "notes": "Morning view of Eiffel Tower."
        },
        {
            "location": {
                "name": "Louvre Museum",
                "coordinates": {"lat": 48.860611, "lng": 2.337644}
            },
            "start_time": "2025-01-25T11:45:00Z",
            "end_time": "2025-01-25T13:30:00Z",
            "notes": "Short visit to Mona Lisa."
        },
        {
            "location": {
                "name": "Notre Dame Cathedral",
                "coordinates": {"lat": 48.852968, "lng": 2.349902}
            },
            "start_time": "2025-01-25T14:00:00Z",
            "end_time": "2025-01-25T15:30:00Z",
            "notes": "Admire the architecture."
        }
    ],
    "created_at": "2025-01-20T08:00:00Z",
    "updated_at": "2025-01-23T18:00:00Z"
}
# Connect to MongoDB and fetch itineraries
collection = connect_to_mongodb(mongodb_uri, db_name, collection_name)
if collection is not None:  # Explicit None check
    itineraries = fetch_itineraries_from_mongodb(collection)
    
    # Load saved data if available
    graph, time_action_data = load_data(file_path)

    # Add itineraries to the graph one by one
    for itinerary in itineraries:
        add_itinerary_to_graph(itinerary, graph, time_action_data)

    # Print the resulting graph
    print_graph(graph)

    # Test the "find_good_next_location" function
    find_good_next_location(graph, "Eiffel Tower")
    find_good_next_location(graph, "Bikini Beans Coffee")

    # Test the "find_most_common_action_in_time_window" function
    query_time = datetime(2025, 1, 25, 10, 0, tzinfo=timezone.utc)
    find_most_common_action_in_time_window(time_action_data, query_time)

    query_time = datetime(2025, 1, 25, 11, 30, tzinfo=timezone.utc)
    find_most_common_action_in_time_window(time_action_data, query_time)

    # Save the data to the file
    save_data(graph, time_action_data, file_path)
else:
    print("Failed to connect to MongoDB. Exiting.")
### Load saved data if available
graph, time_action_data = load_data(file_path)

# Add itineraries to the graph one by one
add_itinerary_to_graph(itinerary1, graph, time_action_data)
add_itinerary_to_graph(itinerary2, graph, time_action_data)

# Print the resulting graph
print_graph(graph)

# Test the "find_good_next_location" function
find_good_next_location(graph, "Eiffel Tower")  # Should recommend "Louvre Museum"
find_good_next_location(graph,"Bikini Beans Coffee")


# Test the "find_most_common_action_in_time_window" function
query_time = datetime(2025, 1, 25, 10, 0, tzinfo=timezone.utc)  # 10:00 AM
find_most_common_action_in_time_window(time_action_data, query_time) #current_utc = datetime.now(timezone.utc)

query_time = datetime(2025, 1, 25, 11, 30, tzinfo=timezone.utc)  # 11:30 AM
find_most_common_action_in_time_window(time_action_data, query_time)

# Save the data to the file
save_data(graph, time_action_data, file_path)