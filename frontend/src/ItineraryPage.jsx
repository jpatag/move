import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import DropdownMenu from "./components/DropdownMenu";
import Entry from "./components/Entry";

const dummyEntries = [
  {
    id: 1,
    title: "Papa’s Pizzeria",
    address: "123 Main St, Cityville",
    startTime: "01/02/2025 5:30 PM",
    endTime: "01/02/2025 6:00 PM",
    caption: "Caption ",
    image: "https://i.imgur.com/6g7wX6G.png"
  },
  {
    id: 2,
    title: "It can also be a map pin",
    address: "Central Park, NYC",
    startTime: "01/02/2025 6:30 PM",
    endTime: "01/02/2025 7:00 PM",
    caption: "Caption describing the event or no caption",
    image: "https://i.imgur.com/6g7wX6G.png" // Example map image
  },
  {
    id: 3,
    title: "Papa’s Pizzeria",
    address: "123 Main St, Cityville",
    startTime: "01/02/2025 7:30 PM",
    endTime: "01/02/2025 8:00 PM",
    caption: "Caption describing the event or no caption bahahahaha dafjoisadfj a iodfjioasd fj",
    image: "https://i.imgur.com/6g7wX6G.png"
  }
];



const ItineraryPage = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);  // Ensure loading state is reset
        setError(null);    // Clear previous errors
        
        const response = await fetch(`http://localhost:5000/api/itineraries/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch itinerary');
        }

        // Ensure entries exists as an array
        const formattedData = {
          ...data.data,
          entries: data.data.entries || []  // Default to empty array
        };

        setItinerary(formattedData);
        
      } catch (err) {
        setError(err.message);
        setItinerary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);  // Dependency array ensures refetch when ID changes

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 text-white p-6">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-800 text-white p-6">
        <div className="text-red-500 text-center text-xl mb-4">Error: {error}</div>
        <Link to="/explore" className="block text-center text-blue-400 hover:text-blue-300">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  // Render no itinerary found
  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gray-800 text-white p-6">
        <div className="text-center text-xl mb-4">Itinerary not found</div>
        <Link to="/explore" className="block text-center text-blue-400 hover:text-blue-300">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  // Main render when data is available
  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <img 
          src="https://i.ibb.co/Y2B1k9W/move-corner-logo.png" 
          alt="Move Logo" 
          className="w-24"
        />
        <DropdownMenu />
      </div>

      {/* Itinerary Content */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{itinerary.itinerary_name}</h1>
        <div className="mb-6 text-gray-400">
          Created by: {itinerary.user_id}
        </div>

        {/* Entries List */}
        <div className="space-y-6">
          {itinerary.entries.map((entry, index) => (
            <Entry
              key={index}
              title={entry.location_name}
              address={entry.address}
              startTime={new Date(entry.time_start).toLocaleString()}
              endTime={new Date(entry.time_end).toLocaleString()}
              caption={entry.notes}
              image="https://i.imgur.com/6g7wX6G.png"
            />
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link 
            to="/explore"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            ← Back to All Itineraries
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage;
