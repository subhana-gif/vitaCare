import React from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

// Define Notification Type

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken")

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center relative">
      <h1 className="text-xl font-bold text-indigo-600">♡ VitaCare</h1>

      <div className="flex items-center gap-6">
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
