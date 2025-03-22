import React from "react";
import { IoLogOutOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const DoctorNavbar = () => {
  const navigate = useNavigate()
  const handleLogOut = ()=>{
    localStorage.removeItem("doctortoken")
    navigate("/doctors/login")
  }
  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">♡ VitaCare</h1>  
      <button onClick={handleLogOut} className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center">
        <IoLogOutOutline className="mr-2" /> Logout
      </button>
    </div>
  );
};

export default DoctorNavbar;
