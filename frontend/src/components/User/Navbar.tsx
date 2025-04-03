import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { logout } from "../../redux/slices/authSlice";
import { io, Socket } from "socket.io-client";
import { RootState } from "../../redux/store";
import { T } from "@tolgee/react";

interface Notification {
  message: string;
  createdAt: Date;
  seen: boolean;
}

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5001", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("joinUserRoom", user._id);
    });

    socket.on("newNotification", (notification: Notification) => {
      console.log("New notification received:", notification);
      setNotifications(prev => [notification, ...prev]);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


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
        <a href="/" className="text-gray-600 text-3xl hover:text-blue-600"> <T keyName="Home">HOME</T></a>
        <a href="/doctors" className="text-gray-600 text-3xl hover:text-blue-600"> <T keyName="ALL_DOCTORS">ALL DOCTORS</T></a>
        <a href="/myAppointments" className="text-gray-600 text-3xl hover:text-blue-600"> <T keyName="APPOINTMENTS">APPOINTMENTS</T></a>
        <a href="/about" className="text-gray-600 text-3xl hover:text-blue-600"><T keyName="ABOUT">ABOUT</T></a>
        <a href="/contact" className="text-gray-600 text-3xl hover:text-blue-600"><T keyName="CONTACT">CONTACT</T></a>
      </div>

      {/* Notification Icon and Dropdown */}
      <div className="relative mr-4" ref={notifRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="text-gray-600 text-3xl hover:text-blue-600 focus:outline-none relative"
        >
          <IoNotificationsOutline className="w-8 h-8" />
          {notifications.filter(n => !n.seen).length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.seen).length}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800"><T keyName="Notifications">Notifications</T></h3>
            </div>
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <p className="text-gray-800">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <T keyName="No_notifications">No notifications</T>
              </div>
            )}
          </div>
        )}
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
              <T keyName="Profile">Profile</T>
            </button>    
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50"
            >
              <T keyName="Logout">Logout</T>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
