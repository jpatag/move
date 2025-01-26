import React from "react";
import ItineraryBox from "./components/ItineraryBox";
import DropdownMenu from "./components/DropdownMenu";

const dummyData = [
  {
    id: 1,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=1"
  },
  {
    id: 2,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=2"
  },
  {
    id: 3,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=3"
  },
  {
    id: 4,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=4"
  },
  {
    id: 5,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=5"
  },
  {
    id: 6,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=6"
  },
  {
    id: 1,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=1"
  },
  {
    id: 2,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=2"
  },
  {
    id: 3,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=3"
  },
  {
    id: 4,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=4"
  },
  {
    id: 5,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=5"
  },
  {
    id: 6,
    image: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
    title: "Itinerary Title",
    avatar: "https://i.pravatar.cc/50?img=6"
  }
];

function Explore() {
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
        {dummyData.map((item) => (
          <ItineraryBox key={item.id} id={item.id} image={item.image} title={item.title} avatar={item.avatar} />
        ))}
      </div>
    </div>
  );
}

export default Explore;