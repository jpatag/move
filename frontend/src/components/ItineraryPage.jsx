import { useParams, Link } from "react-router-dom";

function ItineraryPage() {
  const { id } = useParams(); // Get the ID from URL

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold">Itinerary #{id}</h1>
      <p className="mt-4 text-gray-300">This is the itinerary details page.</p>

      {/* Back Button */}
      <Link to="/explore">
        <button className="mt-6 px-6 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition">
          ← Back to Explore
        </button>
      </Link>
    </div>
  );
}

export default ItineraryPage;
