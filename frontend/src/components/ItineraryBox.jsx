import { Link } from "react-router-dom";

const ItineraryBox = ({ id, image, title, avatar }) => {
  return (
    <Link to={`/itinerary/${id}`} className="relative bg-gray-700 rounded-lg overflow-hidden shadow-lg w-48 h-36 block animation-fade">
      {/* Background Image */}
      <img src={image} alt="Itinerary" className="w-full h-full object-cover" />

      {/* Overlay for Title */}
      <div className="absolute bottom-0 w-full bg-gray-700 text-white text-center text-sm py-1">
        {title}
      </div>

      {/* Avatar */}
      <div className="absolute bottom-2 right-2 bg-purple-300 rounded-full border-2 border-gray-800">
        <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
      </div>
    </Link>
  );
};

export default ItineraryBox;
