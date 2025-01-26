import React from "react";

const Entry = ({ title, address, startTime, endTime, caption, image }) => {
  return (
    <div className="flex bg-gray-700 rounded-lg shadow-lg w-full">
      {/* Left Side - Text Content */}
      <div className="flex-1 m-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-sm text-gray-300">{address}</p>
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-gray-200">Start:</span> {startTime} <br />
          <span className="font-semibold text-gray-200">End:</span> {endTime}
        </p>
        <p className="text-sm text-gray-300 mt-2">{caption}</p>
      </div>

      {/* Right Side - Image */}
      <div className="w-40 h-auto">
        <img src={image} alt="Location" className="w-full h-full rounded-lg object-cover" />
      </div>
    </div>
  );
};

export default Entry;
