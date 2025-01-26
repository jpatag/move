import { useState } from "react";
import { Link } from "react-router-dom";
import Entry from "./components/Entry";
import DropdownMenu from "./components/DropdownMenu";

function CreateItinerary() {
  const [itineraryName, setItineraryName] = useState("My Itinerary");
  const [isEditing, setIsEditing] = useState(false);
  const [entries, setEntries] = useState([
    {
        id: 1,
        title: "Papa’s Pizzeria",
        address: "123 Main St, Cityville",
        startTime: "01/02/2025 5:30 PM",
        endTime: "01/02/2025 6:00 PM",
        caption: "Caption ",
        image: "https://i.imgur.com/6g7wX6G.png"
    },
  ]);

  const handleDelete = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <img 
            src="https://i.ibb.co/Y2B1k9W/move-corner-logo.png" 
            alt="Move Logo" 
            className="w-24"
        />
        <DropdownMenu />
      </div>

      {/* Itinerary Name (Editable) */}
      <div className="flex items-center gap-2 bg-gray-700 p-3 rounded-lg">
        {isEditing ? (
          <input
            type="text"
            value={itineraryName}
            onChange={(e) => setItineraryName(e.target.value)}
            className="bg-transparent text-lg flex-1 outline-none px-2"
            autoFocus
          />
        ) : (
          <h2 className="text-lg font-bold flex-1">{itineraryName}</h2>
        )}
        <button 
          className="text-gray-400 hover:text-white"
          onClick={toggleEditing}
        >
          {isEditing ? "💾" : "✏️"} {/* Changes icon based on state */}
        </button>
      </div>

      {/* Entries List */}
      <div className="mt-4 sm:min-w-130">
        {entries.map((entry) => (
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

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <Link to="/add-entry">
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            Add Entry
          </button>
        </Link>
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
          Save
        </button>
      </div>
    </div>
  );
}

export default CreateItinerary;
