import React from "react";
import { NavLink } from "react-router-dom";

const DoctorSidebar: React.FC = () => {
  return (
    <div className="text-white p-5 h-full">
      <ul className="space-y-5">
        <li>
          <NavLink 
            to="/doctor/dashboard"
            end  
            className={({ isActive }: { isActive: boolean }) =>
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
            to="/doctor/appointments"
            className={({ isActive }: { isActive: boolean }) =>
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
            to="/doctor/chat"
            className={({ isActive }: { isActive: boolean }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Chat
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/doctor/reviews"
            className={({ isActive }: { isActive: boolean }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Reviews & Ratings
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/doctor/slot"
            className={({ isActive }: { isActive: boolean }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Slot Management
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/doctor/profile"
            className={({ isActive }: { isActive: boolean }) =>
              `p-2 block rounded-md transition-all duration-300 ease-in-out ${
                isActive ? "bg-white text-indigo-500 font-bold" : "hover:bg-indigo-600"
              }`
            }
          >
            Profile
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default DoctorSidebar;
