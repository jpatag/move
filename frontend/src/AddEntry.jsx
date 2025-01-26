import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddEntry() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState("");
  const [caption, setCaption] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a new entry object
    const newEntry = {
      id: Date.now(), // Unique ID
      name,
      location,
      startTime,
      endTime,
      image,
      caption,
    };

    // Retrieve existing entries from localStorage
    const existingEntries = JSON.parse(localStorage.getItem("itineraryEntries")) || [];

    // Add new entry to the existing list
    const updatedEntries = [...existingEntries, newEntry];

    // Save updated list to localStorage
    localStorage.setItem("itineraryEntries", JSON.stringify(updatedEntries));

    // Navigate back to the itinerary page
    navigate("/create");
  };

  return (
    <div className="min-h-screen bg-gray-8-- text-white p-6">
      <img 
                src="https://i.ibb.co/Y2B1k9W/move-corner-logo.png" 
                alt="Move Logo" 
                className="w-24"
                />
      <h1 className="text-2xl font-light mb-4">Add New Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-gray-300 text-sm">Name</label>
          <input
            type="text"
            placeholder="Event or Place Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg text-white outline-none"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-gray-300 text-sm">Location</label>
          <input
            type="text"
            placeholder="Address or Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg text-white outline-none"
            required
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-gray-300 text-sm">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg text-white outline-none"
            required
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-gray-300 text-sm">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg text-white outline-none"
            required
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-gray-300 text-sm">Image URL</label>
          <input
            type="text"
            placeholder="Paste an image link"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg text-white outline-none"
          />
        </div>

        {/* Caption */}
        <div>
          <label className="block text-gray-300 text-sm">Caption</label>
          <textarea
            placeholder="Add a short caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-lg text-white outline-none h-20"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-purple-600 p-2 rounded-lg hover:bg-purple-500 transition"
          >
            Add Entry
          </button>

          <button
            type="button"
            onClick={() => navigate("/create")}
            className="flex-1 bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEntry;
