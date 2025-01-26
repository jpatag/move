import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Entry from "./components/Entry";
import DropdownMenu from "./components/DropdownMenu";

function CreateItinerary() {
  const [itineraryName, setItineraryName] = useState("My Itinerary");
  const [isEditing, setIsEditing] = useState(false);
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  // Load itinerary data from localStorage on mount
  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem("itineraryEntries")) || [];
    const storedName = localStorage.getItem("itineraryName") || "My Itinerary";
    setEntries(storedEntries);
    setItineraryName(storedName);
  }, []);

  // Save itinerary name in localStorage when updated
  useEffect(() => {
    localStorage.setItem("itineraryName", itineraryName);
  }, [itineraryName]);

  // Delete an entry and update localStorage
  const handleDelete = (id) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem("itineraryEntries", JSON.stringify(updatedEntries));
  };

  // Toggle itinerary name editing
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  // Clear localStorage and reset the itinerary
  const handleCancel = () => {
    localStorage.removeItem("itineraryEntries");
    localStorage.removeItem("itineraryName");
    setEntries([]);
    setItineraryName("My Itinerary");
    navigate("/explore"); // Redirect to explore page
  };

  // Save itinerary to database
  const handleSave = async () => {
    handleCancel();
    // const itineraryData = {
    //   name: itineraryName,
    //   entries,
    // };

    // try {
    //   const response = await fetch("http://localhost:5000/add_itinerary", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(itineraryData),
    //   });

    //   if (response.ok) {
    //     alert("Itinerary saved successfully!");
    //     localStorage.removeItem("itineraryEntries");
    //     localStorage.removeItem("itineraryName");
    //     navigate("/explore"); // Redirect to explore page
    //   } else {
    //     throw new Error("Failed to save itinerary");
    //   }
    // } catch (error) {
    //   console.error("Error saving itinerary:", error);
    //   alert("Error saving itinerary. Please try again.");
    // }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <img 
          src="https://i.ibb.co/Y2B1k9W/move-corner-logo.png" 
          alt="Move Logo" 
          className="w-24"
        />
        <DropdownMenu />
      </div>

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
        <button className="text-gray-400 hover:text-white" onClick={toggleEditing}>
          {isEditing ? "💾" : "✏️"}
        </button>
      </div>

      <div className="mt-4 space-y-6 sm:min-w-130">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <Entry
              key={entry.id}
              title={entry.name}
              address={entry.location}
              startTime={entry.startTime}
              endTime={entry.endTime}
              caption={entry.caption}
              image={entry.image}
              onDelete={() => handleDelete(entry.id)}
            />
          ))
        ) : (
          <p className="text-gray-400">No entries yet. Add one below!</p>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <Link to="/add-entry">
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            Add Entry
          </button>
        </Link>
        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
          Save Itinerary
        </button>
        <button onClick={handleCancel} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CreateItinerary;
