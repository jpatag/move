import React, { useState, useEffect } from "react";

const Entry = ({ title, address, startTime, endTime, caption, locationName }) => {
  const [imageUrl, setImageUrl] = useState("https://i.imgur.com/6g7wX6G.png");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // First, search for the location to get the correct page title
        const searchResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(locationName)}&format=json&origin=*`
        );
        const searchData = await searchResponse.json();
        const searchResults = searchData.query?.search || [];
        
        if (searchResults.length === 0) return;

        // Get the most relevant page title
        const pageTitle = searchResults[0].title;

        // Fetch the image for the page
        const imageResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=400&origin=*`
        );
        const imageData = await imageResponse.json();
        const pages = imageData.query?.pages || {};
        const pageId = Object.keys(pages)[0];
        const thumbnail = pages[pageId]?.thumbnail?.source;

        if (thumbnail) setImageUrl(thumbnail);
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, [locationName]);

  return (
    <div className="mb-8 bg-gray-900 rounded-lg p-6">
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 mb-2">{address}</p>
      <p className="text-sm text-gray-500 mb-2">
        {startTime} - {endTime}
      </p>
      <p className="text-gray-300">{caption}</p>
    </div>
  );
};

export default Entry;