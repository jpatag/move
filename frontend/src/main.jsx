import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Explore from "./Explore.jsx";
import ItineraryPage from "./ItineraryPage.jsx"; 
import CreateItinerary from "./CreateItinerary";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/create" element={<CreateItinerary />} />
        <Route path="/itinerary/:id" element={<ItineraryPage />} />
      </Routes>
    </Router>
  </StrictMode>
);
