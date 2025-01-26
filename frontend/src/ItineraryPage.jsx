import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import DropdownMenu from "./components/DropdownMenu";
import Entry from "./components/Entry";

const ItineraryPage = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date formatting function
  const formatDateTime = (dateString) => {
    const options = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:5000/api/itineraries/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch itinerary');
        }

        // Process entries with fallbacks
        const formattedData = {
          ...data.data,
          entries: (data.data.entries || []).map(entry => ({
            ...entry,
            image: entry.image || "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg"
          }))
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
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 text-white p-6">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Error state
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

  // No itinerary found
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

  // Main render
  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <img 
          src="https://i.ibb.co/Y2B1k9W/move-corner-logo.png" 
          alt="Move Logo" 
          className="w-24"
        />
        <DropdownMenu />
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{itinerary.itinerary_name}</h1>
        <div className="mb-6 text-gray-400">
          <div className="text-lg text-gray-200">{itinerary.notes}</div>
          <div className="mt-2">Created by: {itinerary.user_id}</div>
        </div>

        {/* Entries List with Google Maps Integration */}
        <div className="space-y-6">
          {itinerary.entries.map((entry, index) => (
            <Entry
              key={entry._id || index} // Use MongoDB _id if available
              title={entry.location_name}
              address={entry.address}
              startTime={formatDateTime(entry.time_start)}
              endTime={formatDateTime(entry.time_end)}
              caption={entry.notes}
              image={entry.image}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link 
            to="/explore"
            className="inline-block px-6 py-3 bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            ← Back to All Itineraries
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage;