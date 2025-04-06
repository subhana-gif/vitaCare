import React, { useState, useRef, useEffect } from "react";
import { IoLogOutOutline, IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

interface Notification {
  message: string;
  createdAt: Date;
  seen: boolean;
}

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:5001", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Admin socket connected");
      socket.emit("joinAdminRoom", "admin");
    });

    socket.on("newNotification", (notification: any) => {
      console.log("New doctor registration notification:", notification);
      if (
        notification &&
        typeof notification.message === "string" &&
        typeof notification.createdAt === "string" &&
        typeof notification.seen === "boolean"
      ) {
        const parsedNotification: Notification = {
          message: notification.message,
          createdAt: new Date(notification.createdAt),
          seen: notification.seen,
        };
        setNotifications((prev) => [parsedNotification, ...prev]);
      } else {
        console.error("Invalid notification received:", notification);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

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

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const unseenNotifications = notifications.filter((n) => !n.seen).length;

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center relative">
      <h1 className="text-xl font-bold text-indigo-600">♡ VitaCare</h1>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2"
          >
            <IoNotificationsOutline className="text-2xl text-gray-600" />
            {unseenNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unseenNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
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
                  No notifications
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <IoLogOutOutline className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;