import React from "react";
import { Link } from "react-router-dom";
import DropdownMenu from "./components/DropdownMenu";

function Account() {
  return (
    <div className="min-h-screen bg-gray-800 text-white p-6 flex flex-col items-center">
      {/* Header */}
      <div className="flex justify-between gap-4 sm:w-130 ">
        <img 
            src="https://i.ibb.co/Y2B1k9W/move-corner-logo.png" 
            alt="Move Logo" 
            className="w-auto h-10"
        />
        <DropdownMenu/>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center pt-4">
        <img
          src="https://via.placeholder.com/100/DDD/AAA?text=User" // Placeholder avatar
          alt="Avatar"
          className="w-24 h-24 rounded-full border-4 border-gray-700"
        />
        <div className=" bg-gray-800 p-1 text-sm rounded-lg text-purple-300 hover:text-purple-800">
          Change Avatar
        </div>
      </div>

      {/* Username */}
      <h2 className="mt-4 text-lg font-semibold">Username</h2>

      {/* Action Buttons */}
      <div className="mt-6 w-full max-w-sm flex flex-col gap-3">
        <button className="w-full bg-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600 transition">
          ✏️ Change Username
        </button>
        <button className="w-full bg-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600 transition">
          ✏️ Change Password
        </button>
        <button className="w-full bg-gray-700 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-600 transition">
          ✏️ Change Email
        </button>
      </div>

      {/* Back to Home */}
      <Link to="/explore">
                  <button className="mt-6 px-6 py-2 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-600 transition">
                  ← Back to Explore
                  </button>
       </Link>
    </div>
  );
}

export default Account;
