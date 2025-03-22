import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-1/5 bg-indigo-500 text-white h-screen p-5">
      <ul className="space-y-5">
        <li>
          <NavLink 
            to="/admin/dashboard"
            end  
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/appointments"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Appointments
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/add-doctor"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Add Doctor
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/speciality"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Speciality Management
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/admin/doctors-list"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Doctors Management
          </NavLink>
        </li>
        <li>    
          <NavLink 
            to="/admin/user-management"
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            User Management
          </NavLink>
        </li>
        <li>    
          <NavLink 
            to="/admin/rejected-doctors"   // ✅ New Link for Rejected Doctors
            className={({ isActive }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
             Rejected Doctors
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
