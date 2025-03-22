import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { logout } from "../../redux/slices/authSlice"; // Adjust the path if needed

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.auth);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleLogout = () => {
    dispatch(logout()); // Dispatch logout action
    navigate("/login"); // Redirect to login page
  };

  const handleProfileClick = () => {
    if (!user) {
      navigate("/login"); // Redirect to login page if not logged in
    } else {
      setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown if logged in
    }
  };



  return (
    <nav className="max-w-9xl mx-auto px-4 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="text-4xl">💙</div>
        <span className="text-5xl font-bold">VitaCare</span>
      </div>

      {/* Centered Nav Links */}
      <div className="flex space-x-8 mx-auto">
        <a href="/" className="text-gray-600 text-3xl hover:text-blue-600">HOME</a>
        <a href="/doctors" className="text-gray-600 text-3xl hover:text-blue-600">ALL DOCTORS</a>
        <a href="/myAppointments" className="text-gray-600 text-3xl hover:text-blue-600">APPOINTMENTS</a>
        <a href="#" className="text-gray-600 text-3xl hover:text-blue-600">ABOUT</a>
        <a href="#" className="text-gray-600 text-3xl hover:text-blue-600">CONTACT</a>
      </div>

      {/* Profile Icon with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleProfileClick}
          className="text-gray-600 text-3xl hover:text-blue-600 focus:outline-none"
        >
          <FaUserCircle className="w-10 h-10" />
        </button>
        {isDropdownOpen && user && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
            <button
              onClick={() => navigate('/profile')}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50"
            >
              Profile
            </button>    
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
