import React, { useState, useEffect } from "react";
import ItineraryBox from "./components/ItineraryBox";
import DropdownMenu from "./components/DropdownMenu";

const placeHolder = 
  {
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    avatar: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
  };




function Explore() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        console.log('Starting fetch...');
        const response = await fetch('http://localhost:5000/api/itineraries'); // Use full URL for debugging
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch itineraries');
        }

        if (data.success) {
          console.log('Received data:', data.data);
          setItineraries(data.data);
        } else {
          throw new Error(data.error || 'API request failed');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-800 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center px-4">
        <img 
            src="https://i.ibb.co/Y2B1k9W/move-corner-logo.png" 
            alt="Move Logo" 
            className="w-24"
            />
        <DropdownMenu />
      </div>
      <h1 className="text-2xl font-light">Explore</h1>

     {/* Itinerary Grid */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {itineraries.map((item) => (
          <ItineraryBox key={item.user_id} id={item.id} image={placeHolder.image} title={item.itinerary_name} avatar={placeHolder.avatar}/>
        ))}
      </div>
    </div>
  );
}

export default Explore;