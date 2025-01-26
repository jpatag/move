import React, { useState, useEffect } from "react";
import ItineraryBox from "./components/ItineraryBox";
import DropdownMenu from "./components/DropdownMenu";
import { FiSearch, FiX } from "react-icons/fi";

const placeHolder = {
  image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
  avatar: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
};

function Explore() {
  const [itineraries, setItineraries] = useState([]);
  const [commonAction, setCommonAction] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState({
    main: true,
    suggestions: false,
    recommendation: false
  });
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [locationImageMap, setLocationImageMap] = useState({});

  const getItineraryImage = (itinerary) => {
    if (!itinerary.entries || itinerary.entries.length === 0) {
      return placeHolder.image;
    }


    const firstLocation = itinerary.entries[0]?.location_name?.toLowerCase() || '';
    return locationImageMap[firstLocation] || placeHolder.image;
  };
  // Filter itineraries based on search query
  const filteredItineraries = itineraries
  .filter(itinerary =>
    itinerary.itinerary_name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .filter((itinerary, index, self) =>
    index === self.findIndex((t) => t._id === itinerary._id)
  );

  

  // Fetch suggestions when user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (locationInput.length > 2) {
        setLoading(prev => ({ ...prev, suggestions: true }));
        try {
          const response = await fetch(
            `http://localhost:5000/api/location-suggestions?search=${locationInput}`
          );
          const data = await response.json();
          if (data.success) setSuggestions(data.data);
        } catch (err) {
          setError('Failed to fetch suggestions');
        } finally {
          setLoading(prev => ({ ...prev, suggestions: false }));
        }
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [locationInput]);

  // Fetch recommendation when location is selected
  useEffect(() => {
    const fetchRecommendation = async () => {
      if (selectedLocation) {
        setLoading(prev => ({ ...prev, recommendation: true }));
        try {
          const response = await fetch(
            `http://localhost:5000/api/recommend-next?start=${selectedLocation}`
          );
          const data = await response.json();
          if (data.success) {
            setRecommendation(data.data.recommended_next_location);
          } else {
            setRecommendation(null);
          }
        } catch (err) {
          setError('Failed to fetch recommendation');
        } finally {
          setLoading(prev => ({ ...prev, recommendation: false }));
        }
      }
    };

    fetchRecommendation();
  }, [selectedLocation]);

  // Fetch main data (itineraries and common action)
  useEffect(() => {
    const fetchMainData = async () => {
      try {
        const [itinerariesRes, actionRes, mapEntriesRes] = await Promise.all([
          fetch('http://localhost:5000/api/itineraries'),
          fetch(`http://localhost:5000/api/common-action?time=${new Date().toISOString()}`),
          fetch('http://localhost:5000/api/map_entries')
        ]);

        const itinerariesData = await itinerariesRes.json();
        const actionData = await actionRes.json();
        const mapEntriesData = await mapEntriesRes.json();

        // Create location-image mapping
        if (mapEntriesData.success) {
          const imageMap = {};
          mapEntriesData.data.forEach(entry => {
            imageMap[entry.location.toLowerCase()] = entry.image || placeHolder.image;
          });
          setLocationImageMap(imageMap);
        }

        if (itinerariesData.success) setItineraries(itinerariesData.data);
        if (actionData.success) setCommonAction(actionData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(prev => ({ ...prev, main: false }));
      }
    };

    fetchMainData();
  }, []);

  if (loading.main) return <div className="text-white text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center px-4">
        <img 
          src="https://i.ibb.co/Y2B1k9W/move-corner-logo.png" 
          alt="Move Logo" 
          className="w-24"
        />
        <DropdownMenu />
      </div>

      <h1 className="text-2xl font-light mb-4">Explore</h1>

      {/* Search Bar for Itineraries */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search itineraries by name..."
          className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Location Search and Recommendation Section */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Where are you now?"
            className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
          
          {loading.suggestions && (
            <div className="absolute top-12 left-0 right-0 bg-gray-700 p-2 rounded">
              Loading suggestions...
            </div>
          )}

          {suggestions.length > 0 && !loading.suggestions && (
            <div className="absolute top-12 left-0 right-0 bg-gray-700 rounded shadow-lg z-10">
              <div className="flex justify-end p-1 border-b border-gray-600">
                <button
                  className="px-2 py-1 text-sm hover:text-gray-300"
                  onClick={() => setSuggestions([])}
                >
                  × Close
                </button>
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => {
                    setSelectedLocation(suggestion.location);
                    setLocationInput(suggestion.location);
                    setSuggestions([]);
                  }}
                >
                  {suggestion.location} - {suggestion.address}
                </div>
              ))}
            </div>
          )}
        </div>

        {loading.recommendation && (
          <div className="text-gray-400">Finding recommendations...</div>
        )}

        {recommendation && (
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-lg">
              Next recommended location:{" "}
              <span className="text-blue-400">{recommendation}</span>
            </p>
          </div>
        )}

        {!recommendation && selectedLocation && !loading.recommendation && (
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400">
              No popular next location found. You're a trailblazer!
            </p>
          </div>
        )}
      </div>

      {/* Common Action Banner */}
      {commonAction && (
        <div className="bg-gray-700 p-4 rounded-lg mb-8">
          {commonAction.data ? (
            <p>
              Most common activity right now:{" "}
              <span className="text-blue-400">
                {commonAction.data.most_common_action}
              </span>
            </p>
          ) : (
            <p className="text-gray-400">{commonAction.message}</p>
          )}
        </div>
      )}

      {/* Itinerary Grid with Search Results */}
      <div className="flex flex-wrap justify-center gap-4">
      {filteredItineraries.length > 0 ? (
  filteredItineraries.map((item) => (
    <ItineraryBox
      key={item.id}  // Use item.id instead of item.user_id
      id={item.id}   // Pass the string ID
      image={getItineraryImage(item)}
      title={item.itinerary_name}
      avatar={placeHolder.avatar}
    />
  ))
) : (
      <div className="text-gray-400 text-center w-full mt-8">
        {searchQuery ? 
          `No itineraries found matching "${searchQuery}"` : 
          "No itineraries available"
        }
      </div>
    )}
      </div>
    </div>
  );
}

export default Explore;