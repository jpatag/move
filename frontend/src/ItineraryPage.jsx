import React from "react";
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
  return (
    <div>
        <div className="flex justify-between items-center px-4">
            <img 
                src="https://i.ibb.co/Y2B1k9W/move-corner-logo.png" 
                alt="Move Logo" 
                className="w-24"
                />
            <DropdownMenu />
        </div>
        <div className="min-h-screen bg-gray-800 text-white p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4">
            <h1 className="text-2xl font-light">Username’s Itinerary</h1>
        </div>

        {/* Itinerary Entries */}
        <div className="mt-6 space-y-4 sm:min-w-150">
            {dummyEntries.map((entry) => (
            <Entry
                key={entry.id}
                title={entry.title}
                address={entry.address}
                startTime={entry.startTime}
                endTime={entry.endTime}
                caption={entry.caption}
                image={entry.image}
            />
            ))}
        </div>

        {/* Back to Explore Button */}
        <Link to="/explore">
            <button className="mt-6 px-6 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition">
            ← Back to Explore
            </button>
        </Link>
        </div>
        
        
    </div>
  );
};

export default ItineraryPage;
