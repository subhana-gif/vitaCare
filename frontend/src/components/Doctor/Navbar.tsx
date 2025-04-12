import React, { useEffect, useState } from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useSelector } from 'react-redux';

interface Notification {
  message: string;
  createdAt: Date;
  isRead: boolean; 
}

const DoctorNavbar = () => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const doctorId = useSelector((state: any) => state.doctors.doctorId);

  useEffect(() => {
    if (!doctorId) return;

    const newSocket = io("http://localhost:5001", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("joinDoctorRoom", doctorId);
    });

    newSocket.on("newNotification", (notification: Notification) => {
      console.log("New notification received:", notification);
      setNotifications(prev => [notification, ...prev]);
      setNotificationCount(prev => prev + 1);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [doctorId]);

  const markNotificationsAsSeen = async () => {
    try {
      await fetch(`http://localhost:5001/api/notifications/mark-seen/${doctorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        isRead: true
      })));
      setNotificationCount(0);
    } catch (error) {
      console.error('Error marking notifications as seen:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markNotificationsAsSeen();
    }
  };
  
  const handleLogOut = () => {
    localStorage.removeItem("doctortoken");
    navigate("/doctors/login");
  };

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">♡ VitaCare</h1>

      <div className="flex items-center space-x-6">
        {/* Notification Icon and Dropdown */}
        <div className="relative cursor-pointer">
          <div onClick={handleNotificationClick}>
            <IoNotificationsOutline className="text-2xl text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </div>

          {/* Notification Dropdown */}
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
                  No new notifications
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button onClick={handleLogOut} className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center">
          <IoLogOutOutline className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default DoctorNavbar;
