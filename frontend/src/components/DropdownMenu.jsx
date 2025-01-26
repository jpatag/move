import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest(".menu-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <div className="menu-container relative">
      {/* Hamburger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-white text-2xl p-2 focus:outline-none"
      >
        &#9776;
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 bg-gray-700 shadow-lg rounded-lg py-2 w-36 z-50">
          <Link to="/account" className="block px-4 py-2 text-white hover:bg-gray-800">
            Account
          </Link>
          <Link to="/explore" className="block px-4 py-2 text-white hover:bg-gray-800">
            Explore
          </Link>
          <Link to="/create" className="block px-4 py-2 text-white hover:bg-gray-800">
            Create
          </Link>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
